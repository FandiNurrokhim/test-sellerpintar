type RadioCircleProps = {
  selected: boolean;
};

export default function RadioCircle({ selected }: RadioCircleProps) {
  return (
    <div
      className={`w-5 h-5 border-2 bg-none rounded-full flex items-center justify-center ${
        selected ? "border-white ring-white" : "border-[#001363] ring-[#001363]"
      }`}
    >
      {selected && (
        <div className="w-2.5 h-2.5 bg-none rounded-full" />
      )}
    </div>
  );
}