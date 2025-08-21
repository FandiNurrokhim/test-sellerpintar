import { SignUpForm } from "@/app/auth/signup/form/form";

export default function SignUpPage() {
  return (
    <div className="w-full bg-[#f3f4f6] overflow-auto dark:bg-[#151515]">
      {/* Main content area */}
      <div className="w-full h-screen flex items-center justify-center">
        <SignUpForm className="max-w-md rounded-lg" />
      </div>
    </div>
  );
}
