import React from "react";
import { PlaygroundMessage, Message } from "@/schemas/assistant/assistant";
import { parseWhatsAppToHTML } from "@/utils/chatHelper";
type ChatItem = PlaygroundMessage | Message;

export const ChatBubble: React.FC<{
  message: ChatItem;
  isUser: boolean;
  isTemp?: boolean;
}> = ({ message, isUser, isTemp }) => {
  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const rawContent = isUser
    ? (message as PlaygroundMessage).content
    : "message" in message
    ? (message as Message).message
    : (message as PlaygroundMessage).content;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} items-end mb-2`}>
      <div className={`flex flex-col max-w-[60%]`}>
        <span className={`text-xs mb-2 ${isUser ? "text-right" : "text-left"} text-gray-400`}>
          {time}
        </span>
        <div
          className={`px-4 py-3 text-xs ${
            isUser
              ? "bg-[#E6EEFF] text-gray-900 self-end"
              : isTemp
              ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 self-start italic text-xs"
              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 self-start"
          }`}
          style={{
            borderTopLeftRadius: isUser ? "18px" : "0rem",
            borderTopRightRadius: isUser ? "0rem" : "18px",
            borderBottomLeftRadius: "18px",
            borderBottomRightRadius: "18px",
          }}
          dangerouslySetInnerHTML={{ __html: parseWhatsAppToHTML(rawContent) }}
        />
      </div>
    </div>
  );
};
