"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Forms/Button";
import { FormField } from "@/components/templates/Forms/FormField";
import { Input } from "@/components/atoms/Forms/Input";
import { Label } from "@/components/atoms/Forms/Label";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/atoms/ToastProvider";
import { authApi } from "@/utils/api";
import { useState } from "react";

import { ControlledCheckbox } from "@/components/templates/Forms/ControlledCheckbox";
import { useZodForm } from "@/hooks/useZodForm";
import { signUpSchema, SignUpFormData } from "@/schemas/auth/register";
import { splitFullName } from "@/utils/name";

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
    control,
    formState: { errors },
  } = useZodForm(signUpSchema, {
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
      agreedToPrivacy: false,
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    if (!data.agreedToTerms) {
      showToast("You must agree to the Terms of Service.", "error");
      return;
    }
    if (!data.agreedToPrivacy) {
      showToast("You must accept the Privacy Policy.", "error");
      return;
    }

    setLoading(true);
    try {
      const { firstName, lastName } = splitFullName(data.fullName);
      const response = await authApi.register({
        firstName,
        lastName,
        email: data.email,
        password: data.password,
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
    <div className={cn("w-full h-full flex flex-col", className)} {...props}>
      <div className="flex-1">
        <form
          className="p-6 md:p-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start">
              <h1 className="!font-sentient text-3xl font-bold text-left mb-2">
                Sign Up
              </h1>
              <p className="text-[#151515]/50 text-md">
                Create your account to start using our services. Fill in the
                details below to get started.
              </p>
            </div>

            <FormField
              label={
                <Label htmlFor="fullName" className="!font-sentient">
                  Full Name
                </Label>
              }
              input={
                <Input
                  id="fullName"
                  placeholder="Full Name"
                  autoComplete="name"
                  {...register("fullName")}
                />
              }
              error={errors.fullName}
            />

            <FormField
              label={
                <Label htmlFor="email" className="!font-sentient">
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
                />
              }
              error={errors.email}
            />

            <FormField
              label={
                <Label htmlFor="password" className="!font-sentient">
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
                />
              }
              error={errors.password}
            />

            <FormField
              label={
                <Label htmlFor="confirmPassword" className="!font-sentient">
                  Confirm Password
                </Label>
              }
              input={
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
              }
              error={errors.confirmPassword}
            />

            <div className="flex flex-col space-y-3">
              <ControlledCheckbox
                control={control}
                name="agreedToTerms"
                id="terms"
                label={
                  <>
                    I agree to Dora&apos;s{" "}
                    <a
                      href="#"
                      className="!font-sentient text-[#001363] cursor-pointer hover:underline"
                    >
                      Terms of Services
                    </a>
                  </>
                }
              />
              <ControlledCheckbox
                control={control}
                name="agreedToPrivacy"
                id="privacy"
                label={
                  <>
                    I accept Dora&apos;s use of my data for the service and
                    everything else describe in the{" "}
                    <a
                      href="#"
                      className="!font-sentient text-[#001363] hover:underline"
                    >
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="!font-sentient text-[#001363] hover:underline"
                    >
                      Data Processing Agreement
                    </a>
                  </>
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full !font-sentient text-white"
              disabled={loading}
            >
              {loading ? "Loading..." : "Sign up"}
            </Button>
          </div>
        </form>
      </div>

      <div className="text-center !font-sentient text-[#151515]/45 text-sm py-4 mt-4">
        © 2025 Dora. All rights reserved.
      </div>
    </div>
  );
}
