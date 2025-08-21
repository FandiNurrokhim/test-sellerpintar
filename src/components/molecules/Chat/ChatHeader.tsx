import React from "react";
import { ArrowLeft, Share2 } from "lucide-react";
import { useToast } from "@/components/atoms/ToastProvider";

interface ChatHeaderProps {
  conversationId: string;
  status: "standby" | "listening" | "generating";
  disabled?: boolean;
  isShared?: boolean;
  onConversationIdChange?: (id: string | null) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversationId,
  status,
  disabled = false,
  isShared = false,
  onConversationIdChange,
}) => {
  const { showToast } = useToast();

  return (
    <div className="p-6 py-4 dark:border-gray-700 bg-white dark:bg-[#161618]">
      <button
        onClick={() => onConversationIdChange?.(null)}
        className="md:hidden flex items-center justify-start w-full h-8 mb-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        title="Back"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full mr-2" />
        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
          Back
        </span>
      </button>

      <div className="flex items-center gap-4">
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-xs ${
            !disabled
              ? "bg-[linear-gradient(118.86deg,#2FAAB3_24.75%,#006353_88.51%)] text-white"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          {!disabled ? conversationId.slice(-2) : "-"}
        </div>
        <div className="flex-1 flex items-center justify-between gap-4 text-left">
          <div>
            <div
              className={`font-semibold !font-sentient text-sm ${
                !disabled
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 italic"
              }`}
            >
              {!disabled ? `Conversation #${conversationId.slice(-4)}` : "-"}
            </div>
            <div className="text-xs text-gray-400 flex items-center italic gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full mr-1 ${
                  !disabled
                    ? status === "standby"
                      ? "bg-green-500"
                      : status === "listening"
                      ? "bg-yellow-400"
                      : "bg-blue-500"
                    : "bg-gray-300"
                }`}
              />
              {!disabled
                ? status === "standby"
                  ? "Standby"
                  : status === "listening"
                  ? "Listening"
                  : "Generating"
                : ""}
            </div>
          </div>
          {isShared && (
            <Share2
              className={`w-5 h-5 text-[#001363] dark:text-[#1447E6] cursor-pointer hover:text-[#001363] dark:hover:text-[#1447E6] transition-colors ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => {
                if (!disabled) {
                  showToast("Link copied to clipboard!", "success");
                  navigator.clipboard.writeText(
                    `${window.location.origin}${window.location.pathname}?id=${conversationId}`
                  );
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
