import React from "react";
import type {
  WhatsApp,
  ConversationInternal,
} from "@/schemas/whatsapp/whatsapp";
import { AssistantList } from "@/components/molecules/Chat/AssistantList";

interface WhatsAppAssistant extends WhatsApp {
  whatsAppSettingId: string;
  phoneNumber: string;
  botStatus: string;
}

interface WhatsAppConversationListProps {
  assistants: WhatsAppAssistant[];
  selectedAssistant: WhatsAppAssistant | null;
  conversations: ConversationInternal[];
  selectedConversation: ConversationInternal | null;
  loading: boolean;
  setSelectedAssistant: (assistant: WhatsAppAssistant) => void;
  setSelectedConversation: (conv: ConversationInternal | null) => void;
}

export default function WhatsAppConversationList({
  assistants,
  selectedAssistant,
  conversations,
  selectedConversation,
  loading,
  setSelectedAssistant,
  setSelectedConversation,
}: WhatsAppConversationListProps) {
  const handleAssistantChange = (id: string) => {
    const found = assistants.find((a) => a.id === id) as
      | WhatsAppAssistant
      | undefined;
    if (found) {
      setSelectedAssistant(found);
      if (conversations.length === 0) {
        setSelectedConversation(null);
      }
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "-";
    try {
      return new Date(timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#161618] rounded-2xl">
      <AssistantList
        assistants={assistants}
        selectedAssistantId={selectedAssistant?.id ?? null}
        onSelect={handleAssistantChange}
        isCreating={loading}
      />

      <ul className="space-y-2 p-4">
        {!selectedAssistant ? (
          <li className="text-gray-400 text-sm text-center py-4">
            Please select assistant first.
          </li>
        ) : loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <li
              key={idx}
              className="flex items-center gap-3 p-2 rounded-lg animate-pulse"
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800" />
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
              </div>
            </li>
          ))
        ) : conversations.length === 0 ? (
          <li className="text-gray-400 text-sm text-center py-4">
            No conversation found.
          </li>
        ) : (
          conversations.map((conv) => (
            <li
              key={conv.id}
              className={
                "cursor-pointer flex items-center gap-3 p-2 rounded-lg transition-colors group " +
                (selectedConversation?.id === conv.id
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "hover:bg-blue-100 dark:hover:bg-blue-900")
              }
              onClick={() => {
                if (selectedConversation?.id === conv.id) return;
                setSelectedConversation(conv);
              }}
            >
              <div className="!font-sentient flex-shrink-0 h-8 w-8 rounded-full bg-[linear-gradient(118.86deg,#2FAAB3_24.75%,#006353_88.51%)] flex items-center justify-center text-white font-bold text-sm shadow group-hover:scale-105 transition-transform">
                {conv.contactNumber?.slice(-2) || "??"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="!font-sentient text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {conv.contactName || `${conv.contactNumber}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {formatTimestamp(conv.lastMessageAt || conv.updatedAt)}
                </p>
              </div>
              {conv.autoReply ? (
                <span className="ml-auto flex items-center justify-center bg-[#EBF9F1] text-[#1F9254] text-[8px] font-bold w-5 h-5 rounded-full">
                  AI
                </span>
              ) : (
                <span className="ml-auto flex items-center justify-center bg-[#FEE2E2] text-[#DC2626] text-[8px] font-bold w-5 h-5 rounded-full">
                  AI
                </span>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
