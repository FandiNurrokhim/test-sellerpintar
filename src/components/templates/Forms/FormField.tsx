import { ReactNode } from "react";
import { FieldError } from "react-hook-form";

type FormFieldProps = {
  label?: ReactNode;
  input: ReactNode;
  error?: FieldError | string;
};

export function FormField({ label, input, error }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      {label}
      {input}
      {error && (
        <div className="text-xs text-red-500">
          {typeof error === "string" ? error : error?.message}
        </div>
      )}
    </div>
  );
}
