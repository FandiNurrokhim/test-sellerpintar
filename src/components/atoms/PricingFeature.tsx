import Image from "next/image";

type PricingFeatureProps = {
  text: string;
  selected?: boolean;
};

export default function PricingFeature({
  text,
  selected,
}: PricingFeatureProps) {
  return (
    <li
      className={`flex items-start gap-2 text-sm ${
        selected ? "text-white" : "text-gray-700"
      }`}
    >
      <Image
        src="/svg/checkmark-circle.svg"
        alt="Avatar"
        width={15}
        height={15}
        className="rounded-full"
      />
      <span>{text}</span>
    </li>
  );
}
