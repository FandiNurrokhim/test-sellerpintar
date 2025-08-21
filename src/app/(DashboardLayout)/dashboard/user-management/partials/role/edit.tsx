"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { roleSchema } from "@/schemas/organization/role";
import { Input } from "@/components/atoms/Forms/Input";
import { FormField } from "@/components/templates/Forms/FormField";
import { Label } from "@/components/atoms/Forms/Label";
import { Button } from "@/components/atoms/Forms/Button";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import { X } from "lucide-react";

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => void;
  role: RoleFormData;
}

export default function RoleEditModal({
  isOpen,
  onClose,
  onSubmit,
  role,
}: RoleEditModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: role,
  });

  // Reset form when modal opens with new data
  useEffect(() => {
    reset(role);
  }, [role, reset]);

  const onFormSubmit = (data: RoleFormData) => {
    console.log("Edited Role:", data);
    onSubmit(data);
  };

  return (
    <ModalSide isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 mb-4 pb-2 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold !font-sentient dark:text-white/80">Edit Role</h2>
            <p className="text-sm text-gray-500">
              Update the role details below.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex-1 overflow-y-auto space-y-6 pr-4"
        >
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white/80">Role Information</h3>

            <FormField
              label={<Label htmlFor="name">Role Name</Label>}
              input={
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter role name"
                  className="w-full"
                />
              }
              error={errors.name}
            />

            <FormField
              label={<Label htmlFor="organizationId">Organization ID</Label>}
              input={
                <Input
                  id="organizationId"
                  {...register("organizationId")}
                  placeholder="Enter organization ID"
                  className="w-full"
                />
              }
              error={errors.organizationId}
            />

            <FormField
              label={
                <Label htmlFor="permissions">
                  Permissions (comma separated)
                </Label>
              }
              input={
                <Input
                  id="permissions"
                  {...register("permissions", {
                    setValueAs: (v) =>
                      typeof v === "string"
                        ? v.split(",").map((perm) => perm.trim())
                        : v,
                  })}
                  defaultValue={role.permissions.join(", ")}
                  placeholder="e.g. CREATE_USER, VIEW_REPORTS"
                  className="w-full"
                />
              }
              error={
                Array.isArray(errors.permissions)
                  ? errors.permissions[0]
                  : errors.permissions
              }
            />
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-[#161618] py-4 border-t mt-2 flex justify-end gap-2 z-10">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </ModalSide>
  );
}
