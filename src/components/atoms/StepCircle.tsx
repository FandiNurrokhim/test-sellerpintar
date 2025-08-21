type StepCircleProps = {
  active: boolean;
};

export default function StepCircle({ active }: StepCircleProps) {
  return (
    <span
      className={`w-6 h-6 rounded-full flex items-center justify-center z-10 border-none
        ${active ? "bg-[#001363] dark:bg-[#2F49B3] text-white" : "bg-[#C5CCE5] text-gray-500"}
        ring-4 ring-white
      `}
      style={{ zIndex: 10 }}
    >
      <span className="w-2 h-2 rounded-full bg-white" />
    </span>
  );
}