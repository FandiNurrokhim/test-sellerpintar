"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Forms/Button";
import { Input } from "@/components/atoms/Forms/Input";
import { Label } from "@/components/atoms/Forms/Label";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/atoms/ToastProvider";
import Link from "next/link";
import Logo from "../../../../../public/images/logos/LogoIpsum.png";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";

import { useZodForm } from "@/hooks/useZodForm";
import { z } from "zod";
import { useState } from "react";

import { FormField } from "@/components/templates/Forms/FormField";

const loginSchema = z.object({
  username: z.string().min(8, "Username must be at least 8 characters."),
  password: z.string().min(8, "Password must be at least 8 characters."),
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
    defaultValues: { username: "", password: "", remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        remember: data.remember,
        redirect: false,
      });

      if (result?.error) {
        showToast("username or password wrong.", "error");
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
        <form className="p-6 md:p-4 w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <Image
              src={Logo}
              alt="Logo Title"
              height={24}
              className="mx-auto pt-6 pb-2 hidden lg:inline-block"
            />

            <FormField
              label={<Label htmlFor="username">Username</Label>}
              input={
                <Input
                  id="username"
                  type="username"
                  placeholder="Input username"
                  autoComplete="username"
                  {...register("username")}
                  errorMessage={errors.username?.message}
                />
              }
              error={errors.username}
            />

            <FormField
              label={<Label htmlFor="password">Password</Label>}
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

            <Button
              className="w-full !font-medium mt-2 mb-3"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Login"}
            </Button>

            <div className="text-center text-slate-600 font-light text-sm dark:text-white/80 pb-6 !font-archivo">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-normal text-blue-600 hover:text-blue-800 transition hover:underline dark:text-white/80"
              >
                Register
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
