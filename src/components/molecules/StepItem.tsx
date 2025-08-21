import StepCircle from "../atoms/StepCircle";
import StepText from "../atoms/StepText";

type StepItemProps = {
  title: string;
  description: string;
  index: number;
  active: boolean;
  isLast: boolean;
  activeStep: number;
};

export default function StepItem({
  title,
  description,
  index,
  active,
  isLast,
  activeStep,
}: StepItemProps) {
  const isActive = index === activeStep;
  return (
    <div
      className={`relative w-full flex items-center p-4 min-h-24 ${
        isActive
          ? "bg-[#EEF2FB80] border border-[#D6DCE9] text-blue-600 hover:text-blue-800 transition rounded-2xl"
          : "text-[#A3AED0]"
      }`}
    >
      <div className="relative flex flex-col items-center">
        <StepCircle active={active} />
      </div>
      {!isLast && (
        <span
          className={`absolute left-7 top-16 h-full -translate-x-1/2 w-0.5 ${
            active ? "bg-[#001363] dark:bg-[#2F49B3]" : "bg-[#0013634D]"
          }`}
          style={{
            minHeight: 40,
          }}
        />
      )}
      {/* Konten step */}
      <StepText title={title} description={description} />
    </div>
  );
}
