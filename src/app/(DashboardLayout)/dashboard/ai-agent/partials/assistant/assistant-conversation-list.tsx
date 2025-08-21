import { Plus } from "lucide-react";
import React from "react";
import type { Assistant, Conversation } from "@/schemas/assistant/assistant";
import { AssistantList } from "@/components/molecules/Chat/AssistantList";
import { Button } from "@/components/atoms/Forms/Button";

interface AssistantConversationList {
  assistants: Assistant[];
  selectedAssistant: Assistant | null;
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  loading: boolean;
  setSelectedAssistant: (assistant: Assistant) => void;
  setSelectedConversation: (conv: Conversation | null) => void;
  setPendingConversationId: (id: string | null) => void;
  setIsNewConversation: (isNewConversation: boolean) => void;
}

export default function AssistantConversationList({
  assistants,
  selectedAssistant,
  conversations,
  selectedConversation,
  loading,
  setSelectedAssistant,
  setSelectedConversation,
  setPendingConversationId,
  setIsNewConversation,
}: AssistantConversationList) {
  const handleAssistantChange = (id: string) => {
    const found = assistants.find((a) => a.id === id);
    if (found) {
      setSelectedAssistant(found);
      if (conversations.length > 0) {
        setPendingConversationId(null);
      } else {
        setSelectedConversation(null);
        setPendingConversationId(null);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#161618] rounded-2xl">
      <AssistantList
        assistants={assistants}
        selectedAssistantId={selectedAssistant?.id ?? null}
        onSelect={handleAssistantChange}
        isCreating={loading}
      />

      <div className="px-6 pt-6">
        <Button
          type="button"
          className="w-full flex items-center justify-center gap-3 rounded-[8px] text-xs font-bold cursor-pointer bg-[#001363] hover:bg-[#001363]/90 text-white h-[37px] transition-all shadow-none"
          title="Start a new conversation"
          onClick={() => {
            setSelectedConversation(null);
            setPendingConversationId(null);
            setIsNewConversation(true);
          }}
        >
          <Plus className="w-3 h-3 text-white" />
          New Conversation
        </Button>
        <div className="w-full h-[1px] bg-[#E5E5E5] mt-6 rounded-full" />
      </div>

      <ul className="space-y-2 p-4 overflow-y-scroll h-[calc(100vh-200px)]">
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
                setPendingConversationId(null);
              }}
            >
              <div className="!font-sentient flex-shrink-0 h-8 w-8 rounded-full bg-[linear-gradient(118.86deg,#2FAAB3_24.75%,#006353_88.51%)] flex items-center justify-center text-white font-bold text-sm shadow group-hover:scale-105 transition-transform">
                {conv.id.slice(-2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="!font-sentient text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  Conversation #{""}
                  <span className="!font-sentient text-[#001363] dark:text-[#2F49B3]">
                    {conv.id.slice(-4)}
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {conv.updatedAt
                    ? new Date(conv.updatedAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })
                    : "-"}
                </p>
              </div>
              {!conv.isManualReply && (
                <span className="ml-auto flex items-center justify-center bg-[#EBF9F1] text-[#1F9254] text-[8px] font-bold w-5 h-5 rounded-full">
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
