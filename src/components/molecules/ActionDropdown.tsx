import PortalDropdown from "./PortalDropdown";
import { useState, useRef } from "react";
import { Ellipsis } from "lucide-react";

// Utils
import { cn } from "@/lib/utils";

type BaseItem = {
  id: string | number;
  [key: string]: unknown;
};

export type AdditionalAction<T extends BaseItem = BaseItem> = {
  label: string;
  onClick: (item: T) => void;
  className?: string;
};

type ActionDropdownProps<T extends BaseItem = BaseItem> = {
  item: T;
  onView?: (item: T) => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  editLabel?: string;
  deleteLabel?: string;
  isEditable?: boolean;
  additionalActions?: AdditionalAction<T>[];
  className?: string;
};

export default function ActionDropdown<T extends BaseItem = BaseItem>({
  item,
  onView,
  onEdit,
  onDelete,
  editLabel = "Edit",
  isEditable = true,
  deleteLabel = "Delete",
  additionalActions = [],
  className,
}: ActionDropdownProps<T>) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "bottom"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = () => {
    if (!isDropdownOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 70 + additionalActions.length * 40;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
    setIsDropdownOpen(!isDropdownOpen);
  };
  const handleAction = (action: () => void) => {
    setIsDropdownOpen(false);
    action();
  };

  return (
    <div className="relative z-10" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232336] transition-colors",
          className 
        )}
        onClick={toggleDropdown}
        title="More actions"
      >
        <Ellipsis className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>

      {isDropdownOpen && (
        <PortalDropdown
          anchorEl={buttonRef.current}
          position={dropdownPosition}
          onClose={() => setIsDropdownOpen(false)}
        >
          <div
            className={`w-40 rounded-md shadow-lg bg-white dark:bg-[#232336] z-50
            ${dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"}
          `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              {onView && (
                <button
                  className="font-normal flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-black/20 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                  role="menuitem"
                  onClick={() => handleAction(() => onView(item))}
                >
                  Detail
                </button>
              )}
              {isEditable && (
                <button
                  className="font-normal flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-black/20 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                  role="menuitem"
                  onClick={() => handleAction(() => onEdit(item))}
                >
                  {editLabel}
                </button>
              )}

              {additionalActions.map((action, index) => (
                <button
                  key={index}
                  className={`font-normal flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-black/20 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer ${
                    action.className || ""
                  }`}
                  role="menuitem"
                  onClick={() => handleAction(() => action.onClick(item))}
                >
                  {action.label}
                </button>
              ))}

              <button
                className="font-normal flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-black/20 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                role="menuitem"
                onClick={() => handleAction(() => onDelete(item))}
              >
                {deleteLabel}
              </button>
            </div>
          </div>
        </PortalDropdown>
      )}
    </div>
  );
}
