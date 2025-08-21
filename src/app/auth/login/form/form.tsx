"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Forms/Button";
import { Input } from "@/components/atoms/Forms/Input";
import { Label } from "@/components/atoms/Forms/Label";
import { Checkbox } from "@/components/atoms/Forms/Checkbox";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/atoms/ToastProvider";
import Link from "next/link";
import LogoTitleIcon from "../../../../../public/images/logos/logo-title.png";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";

import { useZodForm } from "@/hooks/useZodForm";
import { z } from "zod";
import { Controller } from "react-hook-form";
import { useState } from "react";

import { FormField } from "@/components/templates/Forms/FormField";
// import LoginWithGoogle from "@/components/atoms/LoginWithGoogle";

const loginSchema = z.object({
  email: z.string().email("Email format is invalid."),
  password: z.string().min(1, "Password required."),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useZodForm(loginSchema, {
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        remember: data.remember,
        redirect: false,
      });

      if (result?.error) {
        showToast("Email or password wrong.", "error");
        setIsLoading(false);
        return;
      }

      let session = await getSession();
      let retry = 0;
      while ((!session || !session.user) && retry < 10) {
        await new Promise((res) => setTimeout(res, 200));
        session = await getSession();
        retry++;
      }

      showToast("Login successful!", "success");
      const role = session?.user?.role;
      const redirectPath =
        role?.toLowerCase() === "admin" ? "/dashboard" : "/dashboard";
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      showToast("An error occurred during login.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full bg-white", className)} {...props}>
      <div className="flex-1 items-center overflow-y-auto grid p-0">
        <form className="p-6 md:p-8 w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <Image
              src={LogoTitleIcon}
              alt="Logo Title"
              height={45}
              className="ml-4 hidden lg:inline-block"
            />

            <FormField
              label={
                <Label htmlFor="email" className="!font-sentient mb-2">
                  Email
                </Label>
              }
              input={
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  {...register("email")}
                  errorMessage={errors.email?.message}
                />
              }
              error={errors.email}
            />

            <FormField
              label={
                <Label htmlFor="password" className="!font-sentient mb-2">
                  Password
                </Label>
              }
              input={
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  {...register("password")}
                  errorMessage={errors.password?.message}
                />
              }
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <Controller
                name="remember"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(Boolean(v))}
                    />
                    <label
                      htmlFor="remember"
                      className="!font-sentient text-[#151515]/40 text-sm dark:text-white/80 cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>
                )}
              />

              <a href="#" className="text-sm font-normal">
                <Label className="!font-sentient text-[#001363] font-medium hover:underline cursor-pointer">
                  Forgot password
                </Label>
              </a>
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Sign In"}
            </Button>

            {/* <div className="relative flex items-center text-center text-sm">
              <div className="flex-grow border-t border-[#F0F0F0]" />
              <span className="!font-sentient text-[#151515]/60 dark:text-white/80 relative z-10 px-2 mx-2">
                Login with
              </span>
              <div className="flex-grow border-t border-[#F0F0F0]" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <LoginWithGoogle />
            </div> */}

            <div className="text-center text-[#151515]/40 font-light !font-sentient text-sm dark:text-white/80">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold !font-sentient text-[#001363] hover:underline dark:text-white/80"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
