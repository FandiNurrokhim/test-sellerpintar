import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { ChatHeader } from "@/components/molecules/Chat/ChatHeader";
import { ChatArea } from "@/components/molecules/Chat/ChatArea";
import { ChatInput } from "@/components/molecules/Chat/ChatInput";
import Swal from "sweetalert2";
import { useToast } from "@/components/atoms/ToastProvider";

import { assistantApi } from "@/utils/apis/assistant";
import { PlaygroundMessage, Message } from "@/schemas/assistant/assistant";

interface AssistantPlaygroundProps {
  assistantId: string;
  conversationId: string;
  refetch?: () => void;
  isFullscreen?: boolean;
  isNewConversation?: boolean;
  setIsFullscreen?: (isFullscreen: boolean) => void;
  onConversationIdChange?: (id: string | null) => void;
}

type ChatItem = PlaygroundMessage | Message;

export default function AssistantPlayground({
  assistantId,
  conversationId,
  isFullscreen,
  isNewConversation,
  refetch,
  setIsFullscreen,
  onConversationIdChange,
}: AssistantPlaygroundProps) {
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoReply, setAutoReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"standby" | "listening" | "generating">(
    "standby"
  );
  const [localConversationId, setLocalConversationId] = useState<string>(
    conversationId
  );
  const [justCreatedConversationId, setJustCreatedConversationId] = useState<
    string | null
  >(null);
  const { showToast } = useToast();

  const { data: session } = useSession();
  const token = session?.user.accessToken;
  const organizationId = session?.organizationId;
  const branchId = sessionStorage.getItem("branchId") || session?.branchId;

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (organizationId) h["x-organization-id"] = organizationId;
    if (branchId) h["x-branch-id"] = branchId;
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  }, [organizationId, branchId, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (e.target.value.trim()) {
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

  useEffect(() => {
    if (!localConversationId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    assistantApi
      .getConversationHistory(localConversationId, true, { headers })
      .then((res: { data: { messages: PlaygroundMessage[] } }) => {
        const mapped = (res.data.messages || []).map((msg) => {
          if ("type" in msg && msg.type === "user") {
            return msg;
          }
          return { ...msg, type: "assistant" as const };
        });
        setMessages(mapped);
      })
      .catch((err: unknown) => {
        setMessages([]);
        showToast(
          "Failed to fetch conversation history: " +
            (err instanceof Error ? err.message : ""),
          "error"
        );
      })
      .finally(() => setLoading(false));
  }, [assistantId, localConversationId, headers, showToast]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantId) {
      Swal.fire({
        icon: "info",
        title: "Info",
        text: "Please select an assistant first.",
      });
      return;
    }

    if (!input.trim() || !assistantId) return;
    setStatus("generating");
    setLoading(true);

    if (autoReply && !localConversationId) {
      Swal.fire({
        icon: "info",
        title: "Reply as Assistant",
        text:
          "Reply as Assistant only works for an existing conversation. Please select or start a conversation first.",
      });

      setLoading(false);
      setStatus("standby");
      return;
    }

    setMessages((prev) => {
      if (autoReply) {
        return prev;
      }
      return [
        ...prev,
        {
          id: Math.random().toString(),
          conversationId: localConversationId,
          content: input,
          type: "user",
          createdAt: new Date().toISOString(),
          metadata: { source: "web", platform: "desktop" },
        } as PlaygroundMessage,
        {
          conversationId: localConversationId,
          message: "Typing...",
          isNewConversation: false,
          metadata: { source: "web", platform: "desktop" },
          createdAt: new Date().toISOString(),
          temp: true,
          type: "assistant",
        } as Message & { temp?: boolean },
      ];
    });
    setInput("");
    setLoading(true);

    try {
      const payload: Partial<Message> & {
        assistantId: string;
        message: string;
      } = {
        assistantId,
        message: input,
        metadata: { source: "web", platform: "desktop" },
      };
      if (conversationId) {
        payload.conversationId = conversationId;
      }

      let res;
      if (autoReply) {
        res = await assistantApi.replyAsAssistant(
          localConversationId,
          input,
          true,
          { headers }
        );
      } else {
        res = await assistantApi.sendMessage(payload, true, { headers });
      }

      if (!conversationId && res.data?.conversationId) {
        setLocalConversationId(res.data.conversationId);
        setJustCreatedConversationId(res.data.conversationId);
      }

      setMessages((prev) => {
        const filtered = prev.filter(
          (msg) => !(msg as { temp?: boolean }).temp
        );
        if (res.data.message) {
          const newMessages = [
            ...filtered,
            {
              conversationId: res.data.conversationId,
              message: res.data.message,
              isNewConversation:
                "isNewConversation" in res.data &&
                typeof res.data.isNewConversation === "boolean"
                  ? res.data.isNewConversation
                  : false,
              type: "assistant",
              createdAt: res.data.createdAt || new Date().toISOString(),
              metadata: res.data.metadata,
            } as Message,
          ];
          return newMessages;
        }
        return filtered;
      });

      setStatus("standby");
      setLoading(false);

      if (!autoReply && refetch) {
        refetch();
      }
    } catch (err) {
      setMessages((prev) =>
        prev.filter((msg) => !(msg as { temp?: boolean }).temp)
      );
      setStatus("standby");
      setLoading(false);
      showToast(
        "Failed to Send Message " + (err instanceof Error ? err.message : ""),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#F7F8FA] dark:bg-[#161618]">
      <ChatHeader
        conversationId={conversationId}
        status={status}
        disabled={!isNewConversation && !conversationId}
        onConversationIdChange={onConversationIdChange}
      />
      <div className="flex-1 h-full px-8 py-6 bg-[#F3F3F3F3 overflow-y-auto flex flex-col gap-2">
        <ChatArea
          messages={messages}
          loading={loading}
          messagesEndRef={messagesEndRef}
          disabled={!isNewConversation && !conversationId}
        />
      </div>
      <ChatInput
        input={input}
        loading={loading}
        autoReply={autoReply}
        isFullscreen={isFullscreen}
        onInputChange={handleInputChange}
        onSend={handleSend}
        onToggleAutoReply={setAutoReply}
        onToggleFullscreen={() =>
          setIsFullscreen && setIsFullscreen(!isFullscreen)
        }
        disabled={!isNewConversation && !conversationId}
      />
    </div>
  );
}
