"use client";


import { useRouter } from "next/navigation";
import { useToast } from "@/components/atoms/ToastProvider";
import { authApi } from "@/utils/api";
import { useState } from "react";

import { useZodForm } from "@/hooks/useZodForm";
import { signUpSchema, SignUpFormData } from "@/schemas/auth/register";
import { splitFullName } from "@/utils/name";

import { cn } from "@/lib/utils";
import Logo from "../../../../../public/images/logos/LogoIpsum.png";
import Image from "next/image";
import { Button } from "@/components/atoms/Forms/Button";
import { FormField } from "@/components/templates/Forms/FormField";
import { Input } from "@/components/atoms/Forms/Input";
import { Select } from "@/components/atoms/Forms/Select";
import { Label } from "@/components/atoms/Forms/Label";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm(signUpSchema, {
    defaultValues: {
      username: "",
      password: "",
      role: "user",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    try {
      const response = await authApi.register({
        username: data.username,
        password: data.password,
        role: data.role,
      });

      if (response) {
        showToast("Registration successful! Redirecting...", "success");
        router.push("/");
      }
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof error.message === "string"
          ? error.message
          : "Registration failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full bg-white", className)} {...props}>
      <div className="flex-1 items-center overflow-y-auto grid p-0">
        <form className="p-6 md:p-4 w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            {/* Logo, optional */}
            <Image src={Logo} alt="Logo Title" height={24} className="mx-auto pt-6 pb-2 hidden lg:inline-block" />

            <FormField
              label={<Label htmlFor="username">Username</Label>}
              input={
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
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

            <FormField
              label={<Label htmlFor="role">Role</Label>}
              input={
                <Select
                  id="role"
                  {...register("role")}
                  errorMessage={errors.role?.message}
                  options={[
                    { value: "", label: "Select Role" },
                    { value: "user", label: "User" },
                    { value: "admin", label: "Admin" },
                  ]}
                />
              }
              error={errors.role}
            />

            <Button
              className="w-full !font-medium mt-2 mb-3"
              type="submit"
              disabled={loading}
            >
              {loading ? "Loading..." : "Sign up"}
            </Button>

            <div className="text-center text-slate-600 font-light text-sm dark:text-white/80 pb-6 !font-archivo">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="font-normal text-blue-600 hover:text-blue-800 transition hover:underline dark:text-white/80"
              >
                Login
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
