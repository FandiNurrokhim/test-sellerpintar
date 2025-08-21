import { useState } from "react";
import PricingCard from "../molecules/PricingCard";

const pricingOptions = [
  {
    title: "Starter",
    price: "Rp. 49.000,00",
    description:
      "Suitable for MSMEs or individuals who want to start selling via WhatsApp.",
    features: [
      "1 Account admin",
      "1 Account admin",
      "1 Account admin",
      "Maximum 25 Products",
      "Maximum 25 Products",
      "Maximum 25 Products",
      "1 WhatsApp Message Template",
      "1 WhatsApp Message Template",
      "1 WhatsApp Message Template",
    ],
  },
  {
    title: "Starter",
    price: "Rp. 49.000,00",
    description:
      "Suitable for MSMEs or individuals who want to start selling via WhatsApp.",
    features: [
      "1 Account admin",
      "1 Account admin",
      "1 Account admin",
      "Maximum 25 Products",
      "Maximum 25 Products",
      "Maximum 25 Products",
      "1 WhatsApp Message Template",
      "1 WhatsApp Message Template",
      "1 WhatsApp Message Template",
    ],
  },
];

export default function PricingSection() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="grid gap-6">
      {pricingOptions.map((option, index) => (
        <PricingCard
          key={index}
          selected={selected === index}
          onClick={() => setSelected(index)}
          {...option}
        />
      ))}
    </div>
  );
}
