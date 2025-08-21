import React, { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface AssistantListProps {
  assistants: { id: string; name: string; description?: string }[];
  selectedAssistantId: string | null;
  onSelect: (id: string) => void;
  isCreating?: boolean;
}

export const AssistantList: React.FC<AssistantListProps> = ({
  assistants,
  selectedAssistantId,
  onSelect,
  isCreating = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = assistants.find((a) => a.id === selectedAssistantId);
  const header = selected?.name || "";
  const description = selected?.description || "";

  const filtered = assistants.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref}>
      <div
        className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 rounded-t-2xl"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          boxShadow: "0px 4px 36.3px -4px #0000001C",
        }}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#2F49B3] to-[#001363] flex items-center justify-center text-white font-bold text-xs">
          {header?.slice(0, 3) || ""}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-[#151515] dark:text-white/80 leading-tight truncate max-w-[160px]">
            {header
              ? header.slice(0, 24) + (header.length > 24 ? "..." : "")
              : ""}
          </div>
          <div className="text-xs text-gray-500 dark:text-white/60 truncate max-w-[180px]">
            {description
              ? description.slice(0, 40) +
                (description.length > 40 ? "..." : "")
              : ""}
          </div>
        </div>
        <span className="ml-2">
          {open ? (
            <ChevronUp size={18} className="text-[#151515] dark:text-white" />
          ) : (
            <ChevronDown size={18} className="text-[#151515] dark:text-white" />
          )}
        </span>
      </div>
      {open && (
        <div className="relative">
          <div className="absolute left-0 w-full rounded-b-2xl shadow-lg bg-white z-20 dark:bg-[#161618] border border-gray-100 dark:border-[#232336]">
            <div className="p-3 flex items-center gap-2 border-b border-gray-100 dark:border-[#232336]">
              <input
                type="text"
                className="flex-1 text-sm outline-none bg-white dark:bg-[#232336] dark:text-white px-3 py-2 rounded"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                disabled={isCreating}
              />
            </div>
            <ul className="py-1 text-sm text-gray-700 dark:text-white/60 max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-4 py-2 text-gray-400 dark:text-gray-500">
                  No assistants found
                </li>
              ) : (
                filtered.map((assistant) => (
                  <li key={assistant.id}>
                    <button
                      className={`block w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-[#232336] hover:text-gray-900 dark:hover:text-white cursor-pointer rounded ${
                        assistant.id === selectedAssistantId
                          ? "bg-blue-50 dark:bg-[#232336] font-semibold"
                          : ""
                      }`}
                      onClick={() => {
                        onSelect(assistant.id);
                        setOpen(false);
                      }}
                      disabled={isCreating}
                    >
                      <div className="truncate">{assistant.name}</div>
                      <div className="text-xs text-gray-500 dark:text-white/40 truncate">
                        {assistant.description}
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
