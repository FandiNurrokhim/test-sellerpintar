// src/page.tsx
import { LoginForm } from "@/app/auth/login/form/form";

export default function LoginPage() {
  return (
    <div className="w-full bg-[#f3f4f6] overflow-auto dark:bg-[#151515]">
      {/* Main content area */}
      <div className="w-full h-screen flex items-center justify-center">
        <LoginForm className="max-w-md rounded-lg"/>
      </div>
    </div>
  );
}
