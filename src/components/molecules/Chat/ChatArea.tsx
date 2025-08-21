import React, {
  useMemo,
  useEffect,
  useState,
  useRef,
  forwardRef,
  useCallback,
} from "react";
import Image from "next/image";
import { groupMessagesByDate } from "@/utils/chatHelper";
import { DateSeparator } from "./DateSeparator";
import { ChatBubble } from "./ChatBubble";
import { PlaygroundMessage, Message } from "@/schemas/assistant/assistant";
import { ChevronDown } from "lucide-react";

type ChatItem = PlaygroundMessage | Message;

interface ChatAreaProps {
  messages: ChatItem[];
  loading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  disabled: boolean;
  autoScroll?: boolean;
  onReachTop?: () => void;
}

export const ChatArea = forwardRef<HTMLDivElement, ChatAreaProps>(
  (
    {
      messages,
      loading,
      messagesEndRef,
      disabled,
      autoScroll = true,
      onReachTop,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] =
      useState<boolean>(autoScroll);
    const lastScrollTopRef = useRef(0);
    const userInteractedRef = useRef(false);

    const setRefs = useCallback(
      (el: HTMLDivElement | null) => {
        containerRef.current = el;
        setContainerEl(el);
        if (typeof ref === "function") ref(el);
        else if (ref)
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      },
      [ref]
    );

    const markInteracted = useCallback(() => {
      userInteractedRef.current = true;
    }, []);

    useEffect(() => {
      setShouldAutoScroll(autoScroll);
    }, [autoScroll]);

    const grouped = useMemo(() => groupMessagesByDate(messages), [messages]);

    useEffect(() => {
      if (shouldAutoScroll && messagesEndRef?.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages, messagesEndRef, shouldAutoScroll]);

    useEffect(() => {
      if (!containerEl) return;
      containerEl.addEventListener("wheel", markInteracted, { passive: true });
      containerEl.addEventListener("touchstart", markInteracted, {
        passive: true,
      });
      containerEl.addEventListener("pointerdown", markInteracted, {
        passive: true,
      });
      return () => {
        containerEl.removeEventListener("wheel", markInteracted);
        containerEl.removeEventListener("touchstart", markInteracted);
        containerEl.removeEventListener("pointerdown", markInteracted);
      };
    }, [containerEl, markInteracted]);

    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const hasOverflow = scrollHeight > clientHeight + 1;
      const isNearTop = scrollTop <= 50;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      const isScrollingUp = scrollTop < lastScrollTopRef.current;

      setShowScrollButton(!isNearBottom);
      setShouldAutoScroll(isNearBottom);

      if (
        userInteractedRef.current &&
        hasOverflow &&
        isScrollingUp &&
        isNearTop &&
        onReachTop
      ) {
        onReachTop();
      }

      lastScrollTopRef.current = scrollTop;
    };

    const scrollToBottom = () => {
      messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
      setShouldAutoScroll(true);
    };

    return (
      <div
        ref={setRefs}
        onScroll={handleScroll}
        className="flex-1 py-6 overflow-y-auto scrollbar-hide flex flex-col gap-2 relative"
      >
        {disabled && !loading && (
          <div className="w-full h-full flex items-center">
            <Image
              src="/images/assets/yellow-envelope.png"
              alt="No Message"
              width={200}
              height={200}
              className="mx-auto drop-shadow-xl"
            />
          </div>
        )}
        {!disabled &&
          grouped.map((group) => (
            <React.Fragment key={group.dateKey}>
              <DateSeparator date={group.date} />
              {group.messages.map((msg, i) => {
                const isUser = "type" in msg && msg.type === "user";
                const isTemp = (msg as { temp?: boolean }).temp;
                return (
                  <ChatBubble
                    key={"id" in msg ? msg.id : msg.createdAt || i}
                    message={msg}
                    isUser={isUser}
                    isTemp={isTemp}
                  />
                );
              })}
            </React.Fragment>
          ))}
        <div ref={messagesEndRef} />
        {showScrollButton && (
          <div className="sticky bottom-[-10px] flex justify-center">
            <button
              onClick={scrollToBottom}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-colors"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        )}
      </div>
    );
  }
);
ChatArea.displayName = "ChatArea";
