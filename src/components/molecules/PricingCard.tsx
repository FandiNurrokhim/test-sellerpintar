import Image from "next/image";

import RadioCircle from "../atoms/RadioCircle";
import PricingFeature from "../atoms/PricingFeature";

type PricingCardProps = {
  selected: boolean;
  onClick: () => void;
  title: string;
  price: string;
  description: string;
  features: string[];
};

export default function PricingCard({
  selected,
  onClick,
  title,
  price,
  description,
  features,
}: PricingCardProps) {
  return (
    <div
      onClick={onClick}
      className={`w-full p-6 rounded-xl cursor-pointer transition-all border ${
        selected
          ? "bg-[linear-gradient(118.86deg,_#2F49B3_24.75%,_#001363_88.51%)] text-white border-transparent shadow-lg relative"
          : "bg-white text-gray-700 border-gray-200"
      }`}
    >
      <Image
        src="/images/background/pricing-card-bg.png"
        alt="Background pattern"
        fill
        className="object-cover object-bottom right-0 bottom-0 opacity-30 pointer-events-none z-0"
      />
      <div className="flex justify-between items-start">
        <div>
          <h3
            className={`text-[15px] !font-sentient ${
              selected ? "text-white/60" : "text-gray-500"
            }`}
          >
            {title}
          </h3>
          <p className="text-2xl mt-1 font-bold !font-sentient">
            {price}{" "}
            <span
              className={`text-md font-normal !font-sentient ${
                selected ? "text-white/60" : "text-gray-500"
              }`}
            >
              /month
            </span>
          </p>
          <p
            className={`w-[337px] mt-4 text-sm ${
              selected ? "text-white/70" : "text-gray-500"
            }`}
          >
            {description}
          </p>
        </div>
        <RadioCircle selected={selected} />
      </div>

      <ul
        className={`mt-6 grid grid-cols-3 gap-3 ${
          selected ? "text-white" : "text-gray-700"
        }`}
      >
        {features.map((feature, idx) => (
          <PricingFeature key={idx} text={feature} selected={selected} />
        ))}
      </ul>
    </div>
  );
}
