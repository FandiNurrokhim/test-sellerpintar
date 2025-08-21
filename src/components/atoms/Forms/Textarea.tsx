import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  error?: boolean;
  errorMessage?: string;
}

function Textarea({ className, error, errorMessage, ...props }: TextareaProps) {
  return (
    <div>
      <textarea
        data-slot="textarea"
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex w-full min-w-0 rounded-xs border border-[#D9D9D9] bg-transparent px-3 py-1 text-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-gray-900 dark:text-gray-100",
          error &&
            "border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
        style={{ resize: "vertical" }}
      />
      {error && errorMessage && (
        <small className="text-destructive text-xs mt-1 block">
          {errorMessage}
        </small>
      )}
    </div>
  );
}

export { Textarea };
