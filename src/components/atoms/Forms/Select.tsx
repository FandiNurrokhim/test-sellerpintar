import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SelectProps extends React.ComponentProps<"select"> {
  error?: boolean;
  errorMessage?: string;
  options?: { value: string; label: string }[];
}

function Select({
  className,
  error,
  errorMessage,
  children,
  options,
  ...props
}: SelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("relative", className)}>
      <select
        data-slot="select"
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "rounded-lg border border-blue-500 p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 w-full appearance-none transition-colors",
          errorMessage &&
            "border-destructive aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
          className
        )}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="text-gray-700 bg-white"
              >
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        {open ? <ChevronUp /> : <ChevronDown />}
      </span>
      {error && errorMessage && (
        <small className="text-destructive text-xs mt-1 block">
          {errorMessage}
        </small>
      )}
    </div>
  );
}

export { Select };
