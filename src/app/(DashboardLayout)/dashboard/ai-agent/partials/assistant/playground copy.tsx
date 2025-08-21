import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/atoms/Forms/Input";
import { Button } from "@/components/atoms/Forms/Button";
import { ToggleSwitch } from "@/components/atoms/Toogle";
import Swal from "sweetalert2";

import { assistantApi } from "@/utils/apis/assistant";
import { PlaygroundMessage, Message } from "@/schemas/assistant/assistant";
import { Fullscreen, MoveUp } from "lucide-react";

interface AssistantPlaygroundProps {
  assistantId: string;
  conversationId: string;
  refetch?: () => void;
  isFullscreen?: boolean;
  setIsFullscreen?: (isFullscreen: boolean) => void;
  onConversationIdChange?: (id: string) => void;
}

type ChatItem = PlaygroundMessage | Message;

export default function AssistantPlayground({
  assistantId,
  conversationId,
  refetch,
  isFullscreen,
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
        Swal.fire({
          icon: "error",
          title: "Failed",
          text:
            typeof err === "object" &&
            err !== null &&
            "message" in err &&
            typeof (err as { message?: unknown }).message === "string"
              ? (err as { message: string }).message
              : "Failed to fetch conversation",
        });
      })
      .finally(() => setLoading(false));
  }, [assistantId, localConversationId, headers]);

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
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message?: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Failed to send message",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#F7F8FA] dark:bg-[#161618]">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161618]">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-lg">
            {conversationId ? conversationId.slice(-2) : "--"}
          </div>
          <div>
            <div className="font-semibold text-md text-gray-900 dark:text-white">
              {`Conversation #${
                conversationId ? conversationId.slice(-4) : "--"
              }`}
            </div>
            <div className="text-xs text-gray-500 flex items-center italic gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  status === "standby"
                    ? "bg-green-500"
                    : status === "listening"
                    ? "bg-yellow-400"
                    : "bg-blue-500"
                } mr-1`}
              ></span>
              {status === "standby"
                ? "Standby"
                : status === "listening"
                ? "Listening"
                : "Generating"}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-8 py-6 overflow-y-auto flex flex-col gap-2">
        {/* Date separator */}
        <div className="flex justify-center mb-6">
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            Today
          </span>
        </div>
        {/* Messages */}
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-400 text-sm py-4">
            No messages yet.
          </div>
        )}
        {messages.map((msg, idx) => {
          const isUser = "type" in msg && msg.type === "user";
          const isTemp = (msg as { temp?: boolean }).temp;
          const time = msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <div
              key={"id" in msg ? msg.id : msg.createdAt || idx}
              className={`flex ${
                isUser ? "justify-end" : "justify-start"
              } items-end`}
            >
              {!isUser && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm mr-2">
                  11
                </div>
              )}
              <div className={`flex flex-col max-w-[60%]`}>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    isUser
                      ? "bg-[#E6EEFF] text-gray-900 self-end"
                      : isTemp
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 self-start italic text-xs"
                      : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 self-start"
                  }`}
                  style={{
                    borderTopLeftRadius: isUser ? "1.5rem" : "0.5rem",
                    borderTopRightRadius: isUser ? "0.5rem" : "1.5rem",
                    borderBottomLeftRadius: "1.5rem",
                    borderBottomRightRadius: "1.5rem",
                  }}
                >
                  {isUser
                    ? (msg as PlaygroundMessage).content
                    : "message" in msg
                    ? (msg as Message).message
                    : (msg as PlaygroundMessage).content}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    isUser ? "text-right" : "text-left"
                  } text-gray-400`}
                >
                  {time}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6">
        {/* Input Area */}
        <form
          onSubmit={handleSend}
          className="px-6 py-6 rounded-2xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161618'] w-full"
          style={{ position: "sticky", bottom: 0 }}
        >
          <Input
            type="text"
            placeholder="Type a message"
            className="w-full rounded-full  border-none focus:ring-0 !p-0 placeholder:italic"
            value={input}
            onChange={handleInputChange}
            disabled={loading}
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="mt-2 flex items-center gap-3">
              <ToggleSwitch
                checked={autoReply}
                onChange={(e) => setAutoReply(e.target.checked)}
                label="Assistant"
              />
              <Button
                type="button"
                className={`w-[29px] h-[29px] flex items-center justify-center rounded-full border transition-colors duration-200 cursor-pointer
      ${isFullscreen ? "bg-[#001363]" : "bg-transparent"}
      border-gray-300`}
                onClick={() =>
                  setIsFullscreen && setIsFullscreen(!isFullscreen)
                }
                aria-label="Fullscreen"
              >
                <Fullscreen
                  size={24}
                  color={isFullscreen ? "#fff" : "#001363"}
                  strokeWidth={2}
                />
              </Button>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="rounded-full w-[29px] h-[29px] bg-[#2F49B3] hover:bg-[#001363] text-white"
            >
              <MoveUp size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
