import { SignUpForm } from "@/app/auth/signup/form/form";
import WhiteLogoIcon from "../../../../public/images/logos/white-logo.png";
import LogoTitleIcon from "../../../../public/images/logos/logo-title.png";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-2rem)] bg-background">
      <div className="min-h-[calc(100vh-2rem)] flex m-4">
        {/* Left fixed image/background */}
        <div className="hidden lg:block fixed top-4 left-4 h-[calc(100vh-2rem)] w-[25%] rounded-2xl overflow-hidden z-20">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat flex flex-col justify-between p-8 h-full"
            style={{
              backgroundImage: "url('/images/background/signup-bg.png')",
            }}
          >
            {/* Dora logo */}
            <div className="mb-8">
              <Image
                src={WhiteLogoIcon}
                alt="Dora Logo"
                height={60}
                className="rounded"
              />
            </div>
            {/* Welcome text */}
            <div className="text-white pb-12">
              <h2 className="!font-sentient text-2xl font-bold text-white mb-4">
                Welcome to Dora
              </h2>
              <p className="text-white text-md leading-5 font-light max-w-md mx-auto">
                Find your favorite products and chat directly with sellers on
                Dora, a convenient marketplace via WhatsApp!
              </p>
            </div>
          </div>
        </div>

        {/* Right side - SignUp Form (scrollable) */}
        <div className="lg:ml-[27%] w-full flex flex-col h-full">
          <div className="flex flex-col md:flex-row justify-between item-center p-6">
            <div className="flex flex-col gap-2">
              <Link href="#" className="flex">
                <Image
                  src={LogoTitleIcon}
                  alt="Logo Title"
                  height={45}
                />
              </Link>
            </div>

            <div className="text-sm text-[#151515]/40 font-normal !font-sentient">
              Are you part of an agency?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-[#001363] !font-sentient hover:underline"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Form container */}
          <div className="flex-1 flex items-center justify-center pt-10 pb-6 lg:px-8">
            <div className="w-full max-w-md h-full max-h-[calc(100vh-12rem)]">
              <SignUpForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
