import { useForm, UseFormProps } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export function useZodForm<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options?: UseFormProps<z.infer<TSchema>>
) {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    ...options,
  });
}
