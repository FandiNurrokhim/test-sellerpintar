type StepCircleProps = {
  title: string;
  description: string;
};

export default function StepCircle({ title, description }: StepCircleProps) {
  return (
    <div className="flex-1 flex flex-col gap-1 ms-2">
      <h2 className="lg:text-[14px] text-sm font-bold text-gray-900 dark:text-white whitespace-pre-line !font-sentient">
        {title}
      </h2>
      <p className="text-xs text-[#A3AED0] dark:text-gray-300 max-w-xs">
        {description}
      </p>
    </div>
  );
}
