import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { ChatHeader } from "@/components/molecules/Chat/ChatHeader";
import { ChatArea } from "@/components/molecules/Chat/ChatArea";
import { ChatInput } from "@/components/molecules/Chat/ChatInput";
import { PlaygroundMessage, Message } from "@/schemas/assistant/assistant";
import { whatsAppApi } from "@/utils/apis/whatsapp";
import { useSession } from "next-auth/react";

interface WhatsAppPlaygroundProps {
  assistantId: string;
  conversationId: string;
  whatsAppSettingId?: string;
  refetch?: () => void;
  isFullscreen?: boolean;
  setIsFullscreen?: (isFullscreen: boolean) => void;
  onConversationIdChange?: (id: string | null) => void;
}

type ChatItem = PlaygroundMessage | Message;

export default function WhatsAppPlayground({
  assistantId,
  conversationId,
  whatsAppSettingId,
  isFullscreen,
  refetch,
  setIsFullscreen,
  onConversationIdChange,
}: WhatsAppPlaygroundProps) {
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [autoReply, setAutoReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"standby" | "listening" | "generating">(
    "standby"
  );
  const [localConversationId, setLocalConversationId] =
    useState<string>(conversationId);
  const [justCreatedConversationId, setJustCreatedConversationId] = useState<
    string | null
  >(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const { data: session } = useSession();

  const org = JSON.parse(sessionStorage.getItem("organization") || "{}");
  const branch = JSON.parse(sessionStorage.getItem("branch") || "{}");
  const organizationId = org.id || session?.organizationId;
  const branchId =
    branch.id || sessionStorage.getItem("branchId") || session?.branchId;

  const headers = useMemo(() => {
    return {
      "x-organization-id": organizationId,
      "x-branch-id": branchId,
      ...(session?.user?.accessToken && {
        Authorization: `Bearer ${session.user.accessToken}`,
      }),
    };
  }, [organizationId, branchId, session?.user?.accessToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    const isCurrentlyTyping = e.target.value.trim().length > 0;
    setIsTyping(isCurrentlyTyping);

    if (isCurrentlyTyping) {
      setStatus("listening");
    } else {
      setStatus("standby");
    }
  };

  useEffect(() => {
    setLocalConversationId(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (conversationId !== localConversationId) {
      setLocalConversationId(conversationId);
    }
  }, [conversationId, localConversationId]);

  useEffect(() => {
    if (
      onConversationIdChange &&
      justCreatedConversationId &&
      justCreatedConversationId !== conversationId
    ) {
      onConversationIdChange(justCreatedConversationId);
      setJustCreatedConversationId(null);
    }
  }, [justCreatedConversationId, conversationId, onConversationIdChange]);

  const loadMessages = useCallback(
    async (reset = false, offset = 0, limit = 5) => {
      if (!localConversationId) {
        setMessages([]);
        setHasMoreMessages(false);
        setCurrentOffset(0);
        return;
      }

      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await whatsAppApi.getConversationMessages(
          localConversationId,
          { limit, offset },
          true,
          {},
          headers
        );

        if (
          response.success &&
          response.data?.messages &&
          Array.isArray(response.data.messages)
        ) {
          const sortedMessages = response.data.messages.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          const transformedMessages: ChatItem[] = sortedMessages.map((msg) => {
            if (msg.role === "user") {
              return {
                id: `${msg.timestamp}-${Math.random()}`,
                conversationId: localConversationId,
                message: msg.content,
                isNewConversation: false,
                type: "assistant" as const,
                createdAt: msg.timestamp,
                metadata: {
                  source: "whatsapp",
                  platform: "whatsapp",
                  handlerId: msg.handlerId,
                  ...msg.metadata,
                },
              } as Message;
            } else {
              return {
                id: `${msg.timestamp}-${Math.random()}`,
                conversationId: localConversationId,
                userId: msg.handlerId,
                content: msg.content,
                type: "user" as const,
                createdAt: msg.timestamp,
                organizationId,
                branchId,
                metadata: {
                  source: "whatsapp",
                  platform: "whatsapp",
                  ...msg.metadata,
                },
              } as PlaygroundMessage;
            }
          });

          if (reset) {
            setMessages(transformedMessages);
            setCurrentOffset(limit);
          } else {
            setMessages((prev) => [...transformedMessages, ...prev]);
            setCurrentOffset((prev) => prev + limit);
          }

          setHasMoreMessages(response.data.pagination.hasMore);
        }

        if (response.success && response.data?.chatRoom) {
          setAutoReply(response.data.chatRoom.autoReply || false);
        }
      } catch {
        if (reset) {
          setMessages([]);
          setHasMoreMessages(false);
          setCurrentOffset(0);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [localConversationId, headers, organizationId, branchId]
  );

  useEffect(() => {
    loadMessages(true, 0, 5);
    setCurrentOffset(0);
    setHasMoreMessages(true);
  }, [loadMessages]);

  useEffect(() => {
    if (localConversationId) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      if (!isTyping) {
        refreshIntervalRef.current = setInterval(() => {
          if (!isTyping) {
            loadMessages(true, 0, Math.max(5, messages.length));
          }
        }, 3000);
      }

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [localConversationId, loadMessages, messages.length, isTyping]);

  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isAutoScroll && messagesEndRef.current && !loadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      const container = messagesEndRef.current?.parentElement;
      if (container) {
        container.scrollBy({
          top: 20,
          behavior: "smooth",
        });
      }
    }
  }, [messages.length, loadingMore, isAutoScroll]);

  const handleScroll = useCallback(() => {
    if (chatAreaRef.current && hasMoreMessages && !loadingMore) {
      const { scrollTop } = chatAreaRef.current;

      if (scrollTop < 50) {
        loadMessages(false, currentOffset, 5);
      }
    }
  }, [hasMoreMessages, loadingMore, currentOffset, loadMessages]);

  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (chatArea) {
      chatArea.addEventListener("scroll", handleScroll);
      return () => chatArea.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantId) {
      alert("Please select an assistant first.");
      return;
    }

    if (!input.trim() || !assistantId) return;
    setStatus("generating");
    setLoading(true);
    setIsTyping(false);

    if (autoReply && !localConversationId) {
      alert(
        "Reply as Assistant only works for an existing conversation. Please select a conversation first."
      );
      setLoading(false);
      setStatus("standby");
      return;
    }

    if (!autoReply) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          conversationId: localConversationId,
          userId: session?.user?.id || "",
          content: input,
          type: "user",
          createdAt: new Date().toISOString(),
          organizationId,
          branchId,
          metadata: { source: "whatsapp", platform: "whatsapp" },
        } as PlaygroundMessage,
      ]);
    }

    try {
      if (localConversationId && whatsAppSettingId) {
        const response = await whatsAppApi.handleReply(
          localConversationId,
          input,
          {
            agentName: session?.user?.name || "Agent",
            department: "Support",
          },
          true,
          {},
          headers
        );

        if (response.success && response.data) {
          setInput("");
          setStatus("standby");
          setLoading(false);

          if (refetch) {
            refetch();
          }
        } else {
          throw new Error("Failed to send message");
        }
      } else {
        throw new Error(
          "Cannot send message without conversation ID and setting ID"
        );
      }
    } catch (err) {
      if (!autoReply) {
        setMessages((prev) => prev.slice(0, -1));
      }
      setStatus("standby");
      setLoading(false);
      alert(
        `Failed to send message: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const handleToggleAutoReply = async (newAutoReply: boolean) => {
    if (!localConversationId) {
      setAutoReply(newAutoReply);
      return;
    }

    try {
      const response = await whatsAppApi.handleToggleAutoReply(
        localConversationId,
        newAutoReply,
        true,
        {},
        headers
      );

      if (response.success) {
        setAutoReply(newAutoReply);

        if (refetch) {
          refetch();
        }
      } else {
        throw new Error(response.message || "Failed to toggle auto-reply");
      }
    } catch (error) {
      alert(
        `Failed to toggle auto-reply: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleReachTop = useCallback(async () => {
    if (!hasMoreMessages || loadingMore) return;
    setIsAutoScroll(false);
    const el = chatAreaRef.current;
    const prevHeight = el ? el.scrollHeight : 0;
    await loadMessages(false, currentOffset, 5);
    requestAnimationFrame(() => {
      const node = chatAreaRef.current;
      if (node) {
        const newHeight = node.scrollHeight;
        node.scrollTop = newHeight - prevHeight;
      }
    });
  }, [hasMoreMessages, loadingMore, loadMessages, currentOffset]);

  return (
    <div className="w-full flex flex-col h-full bg-[#F7F8FA] dark:bg-[#161618]">
      <ChatHeader
        conversationId={conversationId}
        isShared={true}
        status={status}
        disabled={!conversationId}
        onConversationIdChange={onConversationIdChange}
      />
      <div
        ref={chatAreaRef}
        className="flex-1 h-full px-8 py-6 overflow-y-auto flex flex-col gap-2"
      >
        {loadingMore && (
          <div className="flex justify-center items-center py-2">
            <span className="animate-spin mr-2 h-5 w-5 border-2 border-gray-300 border-t-blue-500 rounded-full"></span>
            <span className="text-gray-500">Loading more messages...</span>
          </div>
        )}
        <ChatArea
          messages={messages}
          loading={loading}
          autoScroll={isAutoScroll}
          messagesEndRef={messagesEndRef}
          disabled={!conversationId}
          onReachTop={handleReachTop}
        />
      </div>
      <ChatInput
        input={input}
        loading={loading}
        autoReply={autoReply}
        isFullscreen={isFullscreen}
        onInputChange={handleInputChange}
        onSend={handleSend}
        onToggleAutoReply={handleToggleAutoReply}
        onToggleFullscreen={() =>
          setIsFullscreen && setIsFullscreen(!isFullscreen)
        }
        disabled={!conversationId}
        toggleLabel="Auto Reply"
      />
    </div>
  );
}
