import Image from "next/image";
import { MapPin } from "lucide-react";

interface UserProfileCardProps {
  name?: string;
  location?: string;
  avatar?: string;
  projects?: number;
  followers?: number;
  following?: number;
  className?: string;
}

export default function UserProfileCard({
  name = "Charles Robbie",
  location = "New York, USA",
  avatar = "/img/avatar-charles.png",
  projects = 28,
  followers = 643,
  following = 76,
  className = "",
}: UserProfileCardProps) {
  return (
    <div
      className={`bg-white h-full dark:bg-[#161618] rounded-2xl p-6 w-full flex flex-col items-center text-center ${className}`}
    >
      <Image
        src={avatar}
        alt="Avatar"
        width={80}
        height={80}
        className="rounded-full"
      />
      <h3 className="lg:text-[24px] text-lg font-semibold text-gray-900 dark:text-white/80 dark:text-white mt-4 !font-sentient">
        {name}
      </h3>
      <p className="text-sm text-[#A3AED0] dark:text-gray-300 flex items-center gap-1 justify-center">
        <MapPin className="w-4 h-4 text-gray-300 dark:text-gray-500" />
        {location}
      </p>

      <div className="flex justify-between items-center w-full mt-6 text-sm text-gray-900 ">
        <div className="flex-1">
          <p className="text-[12px] text-[#A3AED0] dark:text-gray-300">
            Projects
          </p>
          <p className="font-bold lg:text-[24px] text-lg dark:text-white !font-sentient">{projects}</p>
        </div>
        <div className="flex-1">
          <p className="text-[12px] text-[#A3AED0] dark:text-gray-300">
            Followers
          </p>
          <p className="font-bold lg:text-[24px] text-lg dark:text-white !font-sentient">{followers}</p>
        </div>
        <div className="flex-1">
          <p className="text-[12px] text-[#A3AED0] dark:text-gray-300">
            Following
          </p>
          <p className="font-bold lg:text-[24px] text-lg dark:text-white !font-sentient">{following}</p>
        </div>
      </div>
    </div>
  );
}

