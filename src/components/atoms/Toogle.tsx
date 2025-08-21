import React from "react";

interface ToggleSwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function ToggleSwitch({
  label = "Assistant",
  className = "",
  ...props
}: ToggleSwitchProps) {
  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <input type="checkbox" className="sr-only peer" {...props} />
      <div
        className="relative !w-[87px] !h-[29px] rounded-full transition-colors
        bg-gray-200 dark:bg-gray-700
        peer-checked:bg-[#001363] dark:peer-checked:bg-[#001363]
        flex items-center border-[0.5px] border-[#D8D8D8] dark:border-white"
      >
        <span
          className="
          absolute left-0 top-0 !w-[69px] h-full flex items-center justify-center font-semibold text-base transition-all bg-white rounded-[47px] shadow-[8px_0px_11.4px_-2px_rgba(0,0,0,0.11)] text-[#001363] text-[11px]        "
          style={{
            left: props.checked ? "19%" : "0",
            width: "50%",
          }}
        >
          {label}
        </span>
      </div>
    </label>
  );
}
