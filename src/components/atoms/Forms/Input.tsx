import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Search } from "lucide-react";

interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
  errorMessage?: string;
}

function Input({ className, type, error, errorMessage, ...props }: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const isPassword = type === "password";
  const isSearch = type === "search";

  return (
    <div className="relative w-full">
      {isSearch && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Search size={16} className="text-muted-foreground dark:text-white/70" />
        </span>
      )}
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        data-slot="input"
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "file:text-foreground dark:file:text-white/80  placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-transparent dark:bg-input/10 dark:text-white/80 dark:border-gray-700 dark:placeholder:text-gray-400 flex h-9 w-full min-w-0 rounded-xs border border-[#D9D9D9] px-3 py-1 text-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          errorMessage &&
            "border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          isSearch ? "pl-9" : "",
          isPassword ? "pr-9" : "",
          className
        )}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground focus:outline-none dark:text-white/80"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      )}
      {error && errorMessage && (
        <small className="text-destructive text-xs mt-1 block">
          {errorMessage}
        </small>
      )}
    </div>
  );
}

export { Input };
