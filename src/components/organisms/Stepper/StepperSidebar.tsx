import StepItem from "@/components/molecules/StepItem";
import { cn } from "@/lib/utils";

type Step = {
  title: string;
  description: string;
  index?: number;
  active?: boolean;
  isLast?: boolean;
};

type Props = {
  steps: Step[];
  activeStep: number;
  className?: string;
  orientation?: "vertical" | "horizontal";
};

export default function StepperSidebar({
  steps,
  activeStep,
  className,
  orientation = "vertical",
}: Props) {
  return (
    <div
      className={cn(
        orientation === "vertical"
          ? "w-80 bg-white dark:bg-[#161618] rounded-2xl p-4"
          : "w-full bg-white dark:bg-[#161618] rounded-2xl p-4",
        className
      )}
    >
      <div className={orientation === "vertical" ? "p-4" : "pb-4"}>
        <h3 className="text-lg font-semibold mb-2 dark:text-white/80">Step</h3>
        <p className="text-sm text-[#A3AED0] mb-6 dark:text-white/60">
          Start the initial setup process to prepare your store before
          proceeding to the next step.
        </p>
      </div>

      <div
        className={cn(
          orientation === "vertical"
            ? "px-4"
            : "flex gap-4 px-2 overflow-x-auto"
        )}
      >
        {steps.map((step, index) => (
          <StepItem
            key={index}
            title={step.title}
            description={step.description}
            index={index}
            active={index <= activeStep}
            activeStep={activeStep}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
