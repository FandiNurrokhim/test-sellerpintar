import React from "react";
import { Check } from "lucide-react";

type StepItemHorizontalProps = {
  steps: { title: string; description: string; status: boolean }[];
};

export const StepperHorizontal: React.FC<StepItemHorizontalProps> = ({
  steps,
}) => {
  return (
    <div className="w-full p-4 flex flex-col justify-center mx-auto rounded-xl bg-white dark:bg-[#161618] overflow-x-scroll">
      <ul className="relative flex flex-row justify-center gap-x-2">
        {steps.map((step, idx) => (
          <li
            key={idx}
            className="flex items-center gap-x-2 shrink basis-0 flex-1 group"
          >
            <div className="min-w-7 min-h-7 inline-flex justify-center items-center text-xs align-middle">
              <span
                className={`size-7 flex justify-center items-center shrink-0 font-medium rounded-full
                  ${
                    step.status
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-800 dark:bg-white dark:text-neutral-800"
                  }`}
              >
                {step.status ? <Check className="w-4 h-4" /> : idx + 1}
              </span>
            </div>
            <div className="w-full h-px flex-1 bg-gray-200 dark:bg-neutral-700 group-last:hidden"></div>
          </li>
        ))}
      </ul>
      {/* Deskripsi step di bawah */}
      <div className="md:flex hidden flex-row justify-center gap-x-2 mt-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex-1">
            <span className="md:text-sm text-xs font-medium text-gray-800 dark:text-white">
              {step.title}
            </span>
            <p className="md:text-sm text-xs text-gray-500 dark:text-neutral-500">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
