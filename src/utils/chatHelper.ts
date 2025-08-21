import { PlaygroundMessage, Message } from "@/schemas/assistant/assistant";
type ChatItem = PlaygroundMessage | Message;

export const formatDateSeparator = (date: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffTime = today.getTime() - msgDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return `${diffDays} days ago`;
  if (diffDays <= 14) return "1 week ago";
  if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} weeks ago`;
  }
  if (diffDays <= 60) return "1 month ago";
  if (diffDays <= 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
};

export const groupMessagesByDate = (messages: ChatItem[]) => {
  const groups: { dateKey: string; date: Date; messages: ChatItem[] }[] = [];
  let currentGroup: {
    dateKey: string;
    date: Date;
    messages: ChatItem[];
  } | null = null;

  messages.forEach((msg) => {
    if (!msg.createdAt) return;
    const msgDate = new Date(msg.createdAt);
    const dateKey = msgDate.toDateString();
    if (!currentGroup || currentGroup.dateKey !== dateKey) {
      currentGroup = {
        dateKey,
        date: msgDate,
        messages: [msg],
      };
      groups.push(currentGroup);
    } else {
      currentGroup.messages.push(msg);
    }
  });

  return groups;
};

export const parseWhatsAppToHTML = (input: string) => {
return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") 
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>") 
    .replace(/`(.*?)`/g, "<code>$1</code>") 
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>') 
    .replace(/\n/g, "<br/>");
};