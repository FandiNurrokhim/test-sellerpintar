import * as React from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface BaseProps {
  options: Option[];
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  isMultiple?: false;
  isCanAdd?: boolean;
  onAddNew?: (value: string) => Promise<void>;
  value?: string;
  onChange: (value: string) => void;
}

interface MultipleProps {
  options: Option[];
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  isMultiple: true;
  isCanAdd?: boolean;
  onAddNew?: (value: string) => Promise<void>;
  value: string[];
  onChange: (value: string[]) => void;
}

type SelectSearchProps = BaseProps | MultipleProps;

export const SelectSearch: React.FC<SelectSearchProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  error,
  errorMessage,
  isMultiple = false,
  isCanAdd = false,
  onAddNew,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [openAbove, setOpenAbove] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOptions = React.useMemo(() => {
    if (isMultiple) {
      const selectedValues = (value as string[]) ?? [];
      return options.filter((opt) => selectedValues.includes(opt.value));
    } else {
      const singleValue = value as string;
      return singleValue
        ? options.filter((opt) => opt.value === singleValue)
        : [];
    }
  }, [options, value, isMultiple]);

  const handleSelect = (val: string) => {
    if (isMultiple) {
      const selected = (value as string[]) ?? [];
      if (selected.includes(val)) {
        (onChange as (v: string[]) => void)(selected.filter((v) => v !== val));
      } else {
        (onChange as (v: string[]) => void)([...selected, val]);
      }
    } else {
      (onChange as (v: string) => void)(val);
      setOpen(false);
    }
    setSearch("");
  };

  const handleAddNew = async () => {
    if (!search.trim() || !onAddNew || isCreating) return;

    setIsCreating(true);
    try {
      await onAddNew(search.trim());
      setSearch("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to create new:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const displayValue = React.useMemo(() => {
    if (selectedOptions.length > 0) {
      return selectedOptions.map((opt) => opt.label).join(", ");
    }
    return "";
  }, [selectedOptions]);

  const selectedValues: string[] = isMultiple
    ? (value as string[]) ?? []
    : value !== undefined
    ? [value as string]
    : [];

  const showAddNewOption = isCanAdd && search && filteredOptions.length === 0;

  const toggleOpen = () => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const dropdownHeight = 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setOpenAbove(true);
    } else {
      setOpenAbove(false);
    }

    setOpen((o) => !o);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={`w-full text-left border rounded-xs px-3 py-2 text-xs bg-transparent flex items-center justify-between cursor-pointer ${
          error ? "border-destructive" : "border-[#D9D9D9] dark:border-gray-700"
        } dark:bg-[#232336]`}
        onClick={() => toggleOpen()}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={isCreating}
      >
        {displayValue ? (
          <span className="text-[#151515] dark:text-white text-[14px]">
            {displayValue}
          </span>
        ) : (
          <span className="text-[#a5a5a5] dark:text-gray-400 text-[14px]">
            {isCreating ? "Creating..." : placeholder}
          </span>
        )}
        <span className="ml-2">
          {open ? (
            <ChevronUp size={16} className="text-[#151515] dark:text-white" />
          ) : (
            <ChevronDown size={16} className="text-[#151515] dark:text-white" />
          )}
        </span>
      </button>

      {open && (
        <div
          className={`absolute left-0 w-full bg-white border border-[#D9D9D9] rounded-xs shadow-lg dark:bg-[#232336] dark:border-gray-700 z-50 ${
            openAbove ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <div className="flex items-center border-b border-[#D9D9D9] dark:border-gray-700 px-3 py-2">
            <input
              type="text"
              className="flex-1 text-sm outline-none bg-white dark:bg-[#232336] dark:text-white"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              disabled={isCreating}
            />
            {showAddNewOption && (
              <button
                type="button"
                className="text-primary dark:text-blue-400 text-sm font-medium ml-2 hover:opacity-80 disabled:opacity-50"
                onClick={handleAddNew}
                disabled={isCreating}
              >
                <Plus
                  size={18}
                  className="inline mr-1 text-[#007bff] dark:text-[#007bff]"
                />
                {isCreating ? "Creating..." : ""}
              </button>
            )}
          </div>

          <ul
            className="max-h-48 overflow-auto bg-white dark:bg-[#232336]"
            role="listbox"
          >
            {filteredOptions.map((opt) => {
              const isSelected = selectedValues.includes(opt.value);
              return (
                <li
                  key={opt.value}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-primary/10 dark:hover:bg-blue-900 ${
                    isSelected
                      ? "bg-primary/10 dark:bg-blue-900 font-semibold"
                      : ""
                  } dark:text-white`}
                  onClick={() => handleSelect(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  {isMultiple && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="mr-2 align-middle"
                    />
                  )}
                  {opt.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {error && errorMessage && (
        <small className="text-destructive dark:text-red-400 text-sm mt-1 block">
          {errorMessage}
        </small>
      )}
    </div>
  );
};
