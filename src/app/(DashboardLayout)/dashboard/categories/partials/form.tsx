import React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/atoms/Forms/Button";
import { Input } from "@/components/atoms/Forms/Input";
import { Label } from "@/components/atoms/Forms/Label";
import { useZodForm } from "@/hooks/useZodForm";
import { FormField } from "@/components/templates/Forms/FormField";
import { SelectSearch } from "@/components/atoms/Forms/SelectSearch";
import {
  categorySchema,
  CategoryFormData,
} from "@/schemas/products/categories";

import { productApi } from "@/utils/apis/product";
import { useToast } from "@/components/atoms/ToastProvider";
import ModalSide from "@/components/organisms/Modal/ModalSide";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useZodForm(categorySchema);

  const { data: session } = useSession();
  const { showToast } = useToast();
  const organizationId = session?.organizationId;
  const branchId = sessionStorage.getItem("branchId") || session?.branchId;

  const headers: Record<string, string> = {};
  if (organizationId) headers["x-organization-id"] = organizationId;
  if (branchId) headers["x-branch-id"] = branchId;

  const onFormSubmit = async (data: CategoryFormData) => {
    try {
      await productApi.createCategory(data, true, {}, headers);
      showToast("Category added successfully", "success");
      onSubmit(data);
      reset();
      onClose();

      return;
    } catch (err) {
      showToast("Failed to add category: " + (err as Error).message, "error");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <ModalSide isOpen={isOpen} onClose={handleClose}>
      <div className="border-b border-gray-200 mb-4">
        <h2 className="text-lg font-bold !font-sentient dark:text-white/80">
          Add Category
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Fill in the details below to add a new category.
        </p>
      </div>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <FormField
          label={
            <Label className="!font-sentient" htmlFor="name">
              Category Name <span className="text-red-500">*</span>
            </Label>
          }
          input={
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter category name"
              className="w-full"
              required
            />
          }
          error={errors.name}
        />

        <FormField
          label={
            <Label
              className="!font-sentient"
              htmlFor="sequence"
              tooltip="Determines the display order of categories. Lower numbers appear first."
            >
              Sequence <span className="text-red-500">*</span>
            </Label>
          }
          input={
            <Input
              id="sequence"
              type="number"
              {...register("sequence", { valueAsNumber: true })}
              placeholder="Enter sequence number"
              className="w-full"
              required
            />
          }
          error={errors.sequence}
        />

        <FormField
          label={
            <Label className="!font-sentient" htmlFor="active">
              Status <span className="text-red-500">*</span>
            </Label>
          }
          input={
            <SelectSearch
              value={String(watch("active"))}
              onChange={(value: string) => setValue("active", value === "true")}
              options={[
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
              placeholder="Select status"
            />
          }
          error={errors.active}
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </ModalSide>
  );
};
