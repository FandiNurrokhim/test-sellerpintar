import Image from "next/image";

interface FreeTrialCardProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  imgSrc?: string;
  imgAlt?: string;
  imgWidth?: number;
  imgHeight?: number;
  className?: string;
}

export default function FreeTrialCard({
  title = "Try Venus for \n free now!",
  description = "Enter in this creative world. Venus is the best product for your business.",
  buttonText = "Try for free",
  onButtonClick,
  imgSrc = "/images/banner/Image.png",
  imgAlt = "Venus preview",
  imgWidth = 250,
  imgHeight = 200,
  className = "",
}: FreeTrialCardProps) {
  return (
    <div
      className={`bg-white dark:bg-[#161618] rounded-2xl shadow-none flex flex-col sm:flex-row items-center p-8 justify-between w-full ${className}`}
    >
      <div className="flex flex-col text-left justify-between h-full">
        <div className="flex flex-col gap-3">
          <h2 className="lg:text-[34px] text-xl font-bold text-[#161618] dark:text-white whitespace-pre-line !font-sentient">
            {title}
          </h2>
          <p className=" lg:Stext-[16px] text-sm text-[#A3AED0] dark:text-gray-300 max-w-xs">
            {description}
          </p>
        </div>
        <div className="mb-6">
          <button
            className="bg-[#EE9301] dark:bg-white dark:text-[#161618] hover:bg-[#14203c] dark:hover:bg-gray-200 text-white text-sm px-5 py-2 rounded-full flex items-center gap-2 transition-colors duration-200 cursor-pointer !font-sentient"
            onClick={onButtonClick}
          >
            {buttonText}
            <span>
              <Image
                src="/svg/stars.svg"
                alt="Star Icon"
                width={18}
                height={18}
                className="inline-block ml-2 transition-all duration-200 dark:filter dark:invert dark:brightness-75"
              />
            </span>
          </button>
        </div>
      </div>

      <Image
        src={imgSrc}
        alt={imgAlt}
        width={imgWidth}
        height={imgHeight}
        className="rounded-xl object-cover"
      />
    </div>
  );
}
