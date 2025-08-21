import React from "react";
import { Input } from "@/components/atoms/Forms/Input";
import { Button } from "@/components/atoms/Forms/Button";
import { ToggleSwitch } from "@/components/atoms/Toogle";
import { Fullscreen, MoveUp } from "lucide-react";

interface ChatInputProps {
  input: string;
  loading: boolean;
  autoReply: boolean;
  isFullscreen?: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (e: React.FormEvent) => void;
  onToggleAutoReply: (checked: boolean) => void;
  onToggleFullscreen?: () => void;
  toggleLabel?: "Auto Reply" | "Assistant";
}

export const ChatInput: React.FC<ChatInputProps & { disabled?: boolean }> = ({
  input,
  loading,
  autoReply,
  isFullscreen,
  onInputChange,
  onSend,
  onToggleAutoReply,
  onToggleFullscreen,
  disabled = false,
  toggleLabel = "Assistant",
}) => {
  const inputDisabled = loading || disabled || autoReply;
  const sendDisabled = loading || !input.trim() || disabled || autoReply;

  return (
    <div className="p-6">
      <div
        className="relative px-6 py-6 rounded-2xl bg-white dark:bg-gray-800 w-full shadow-sm dark:shadow-gray-900/20"
        style={{ position: "sticky", bottom: 0 }}
      >
        <form onSubmit={onSend}>
          <div className="relative">
            <Input
              type="text"
              placeholder={
                autoReply ? "Auto Reply is active..." : "Type a message"
              }
              className="w-full rounded-full border-none focus:ring-0 !p-0 placeholder:italic bg-transparent dark:bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              value={input}
              onChange={onInputChange}
              disabled={inputDisabled}
            />
            {autoReply && (
              <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-700/50 rounded-full flex items-center justify-center pointer-events-none">
                <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Auto Reply Mode - Input disabled
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="mt-2 flex items-center gap-3">
              <ToggleSwitch
                checked={autoReply}
                onChange={(e) => onToggleAutoReply(e.target.checked)}
                label={toggleLabel}
                disabled={disabled && !autoReply}
              />
              <Button
                type="button"
                className={`w-[29px] h-[29px] flex items-center justify-center rounded-full border transition-colors duration-200 cursor-pointer text-[#001363] dark:text-blue-400 hover:text-white dark:hover:text-white
              ${
                isFullscreen
                  ? "bg-[#001363] dark:bg-blue-600 text-white dark:text-white border-[#001363] dark:border-blue-600"
                  : "bg-transparent dark:bg-transparent hover:bg-[#001363] dark:hover:bg-blue-600"
              }
              border-gray-300 dark:border-gray-600 hover:border-[#001363] dark:hover:border-blue-600`}
                onClick={onToggleFullscreen}
                aria-label="Fullscreen"
                disabled={disabled && !autoReply}
              >
                <Fullscreen size={24} strokeWidth={2} />
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <div className="w-px h-[29px] bg-gray-300 dark:bg-gray-600 mx-2" />
              <Button
                type="submit"
                size="icon"
                disabled={sendDisabled}
                className="rounded-full w-[29px] h-[29px] bg-[#001363] hover:bg-[#2F49B3] dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400"
              >
                <MoveUp size={16} className="font-bold" />
              </Button>
            </div>
          </div>
        </form>
        {disabled && !autoReply && (
          <div className="absolute inset-0 bg-[#FFFFFF99] dark:bg-gray-900/60 backdrop-blur-[5px] rounded-2xl flex items-center justify-center pointer-events-auto"></div>
        )}
      </div>
    </div>
  );
};
