import { cn } from "@/lib/utils"; 

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "px-6 py-2 rounded-full bg-[#001363] dark:bg-[#2F49B3] hover:bg-[#2F49B3] text-white font-semibold disabled:opacity-50 cursor-pointer transition-colors duration-200",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
