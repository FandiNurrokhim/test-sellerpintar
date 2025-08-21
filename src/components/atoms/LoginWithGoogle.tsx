import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/atoms/Forms/Button";

type LoginWithGoogleProps = {
  className?: string;
};

export default function LoginWithGoogle({
  className = "",
}: LoginWithGoogleProps) {
  const handleGoogleLogin = () => {
    signIn("google");
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleLogin}
      className={`w-full !font-sentient cursor-pointer text-sm font-medium rounded py-2 flex items-center justify-center gap-2 text-[#262626] border bg-transparent hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 ${className}`}
      suppressHydrationWarning={true}
    >
      <Image src="/svg/google-logo.svg" alt="Google" width={20} height={20} />
      Google
    </Button>
  );
}
