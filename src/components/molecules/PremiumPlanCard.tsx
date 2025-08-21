import Image from "next/image";
import { IconArrowUp } from "@tabler/icons-react";

export function PremiumPlanCard() {
  return (
    <div className="rounded-3xl text-white p-6 bg-[linear-gradient(135deg,_#001363_30%,_#1A308F_80%,_#2F49B3_100%)] relative overflow-hidden">
      <Image
        src="/images/background/premium-card-bg.png"
        alt="Background pattern"
        fill
        className="object-cover object-bottom right-0 bottom-0 opacity-30 pointer-events-none z-0"
      />
      <div className="relative z-10 flex flex-col h-full">
        <div>
          <Image src="/svg/star.svg" alt="Star" width={32} height={32} />
        </div>
        <div className="mt-4">
          <h3 className="text-white text-lg font-bold mb-2 !font-sentient">
            Premium Plan
          </h3>
          <p className="text-[#FFFFFF99] text-[13px] leading-snug">
            Upgrade your free plan creatibot into premium plan
          </p>
        </div>
        {/* Button */}
        <button className="mt-6 text-xs w-30 bg-white text-[#1E1E1E] font-semibold rounded-full ps-3 py-1 flex items-center gap-2 shadow hover:bg-gradient-to-r hover:from-[#1A308F] hover:to-[#2F49B3] hover:text-white focus:outline-none cursor-pointer transition-all duration-300 !font-sentient btn">
          See Detail
          <span className="inline-flex items-center justify-center w-7 h-7 p-2 rounded-full bg-[#001363] dark:bg-[#2F49B3] text-white ml-2 transition-transform duration-300 btn-hover:rotate-90 btn-hover:bg-white btn-hover:text-[#001363]">
            <IconArrowUp className="transition-transform duration-300 rotate-45 group-hover:rotate-90" />
          </span>
        </button>
      </div>
    </div>
  );
}
