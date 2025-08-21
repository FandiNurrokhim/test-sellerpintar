import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Checkbox } from "@/components/atoms/Forms/Checkbox";

type ControlledCheckboxProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  id: string;
  label: React.ReactNode;
  className?: string;
};

export function ControlledCheckbox<T extends FieldValues>({
  control,
  name,
  id,
  label,
  className,
}: ControlledCheckboxProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="flex items-start space-x-2">
          <Checkbox
            id={id}
            checked={field.value}
            onCheckedChange={(v) => field.onChange(Boolean(v))}
            className={className}
          />
          <label
            htmlFor={id}
            className="text-sm !font-sentient text-[#151515]/40 leading-relaxed"
          >
            {label}
          </label>
        </div>
      )}
    />
  );
}
