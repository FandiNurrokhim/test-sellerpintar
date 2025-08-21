import Image from "next/image";

export default function FeatureLocked() {
  return (
    <div className="flex flex-col items-center justify-center py-8 ">
      <div className="relative mb-2">
        <Image
          src="/images/assets/piala.png"
          alt="Feature Locked"
          width={200}
          height={200}
          className="mx-auto drop-shadow-xl animate-bounce"
        />
      </div>
      <h2 className="text-3xl font-extrabold text-indigo-500 dark:text-indigo-300 mb-2 drop-shadow">
        Setup Complete 🎉
      </h2>
      <p className="text-gray-500 dark:text-gray-300 mb-6 text-center max-w-md">
        Congratulations! You’ve unlocked all features. Start exploring and make
        the most out of your experience.
      </p>
    </div>
  );
}
