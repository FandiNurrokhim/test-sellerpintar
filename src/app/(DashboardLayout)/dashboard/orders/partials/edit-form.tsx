import { z } from "zod";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/atoms/Forms/Button";
import { Label } from "@/components/atoms/Forms/Label";
import { useZodForm } from "@/hooks/useZodForm";
import { FormField } from "@/components/templates/Forms/FormField";
import { SelectSearch } from "@/components/atoms/Forms/SelectSearch";
import Modal from "@/components/organisms/Modal/Modal";
import Swal from "sweetalert2";
import { orderApi } from "@/utils/apis/orders";

interface EditOrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: string) => void;
  orderId: string | null;
  initialStatus?: number; // Ubah ke number
}

// Mapping status number ke string
const statusMap = [
  "CREATED",
  "AWAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "EXPIRED",
];

export const EditOrderStatusModal: React.FC<EditOrderStatusModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  orderId,
  initialStatus,
}) => {
  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useZodForm(z.object({ status: z.string().min(1) }));

  const [status, setStatus] = useState<string>(
    typeof initialStatus === "number" && statusMap[initialStatus]
      ? statusMap[initialStatus]
      : "CREATED"
  );
  const { data: session } = useSession();
  const token = session?.user.accessToken;
  const organizationId = session?.organizationId;
  const branchId = sessionStorage.getItem("branchId") || session?.branchId;

  const headers: Record<string, string> = {};
  if (organizationId) headers["x-organization-id"] = organizationId;
  if (branchId) headers["x-branch-id"] = branchId;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const statusOptions = [
    { value: "CREATED", label: "Created" },
    { value: "AWAITING_PAYMENT", label: "Awaiting Payment" },
    { value: "PAID", label: "Paid" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "EXPIRED", label: "Expired" },
  ];

  useEffect(() => {
    if (isOpen) {
      const defaultStatus =
        typeof initialStatus === "number" && statusMap[initialStatus]
          ? statusMap[initialStatus]
          : "CREATED";
      setStatus(defaultStatus);
      reset({ status: defaultStatus });
    }
  }, [isOpen, initialStatus, reset]);

  const onFormSubmit = async () => {
    if (!orderId) return;
    try {
      await orderApi.updateStatus(orderId, { status }, true, { headers });
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Order status updated successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
      onSubmit(status);
      onClose();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          typeof err === "object" && err !== null && "message" in err
            ? (err as { message?: string }).message
            : "Failed to update order status",
      });
    }
  };

  const handleClose = () => {
    reset();
    setStatus("CREATED");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="border-b border-gray-200 mb-4">
        <h2 className="text-lg font-bold !font-sentient dark:text-white/80">Edit Order Status</h2>
        <p className="text-sm text-gray-500 mb-4">
          Update the order status below.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="space-y-6 max-h-[70vh] overflow-y-auto"
      >
        <div className="space-y-4">
          <FormField
            label={
              <Label className="!font-sentient" htmlFor="status">
                Status
              </Label>
            }
            input={
              <SelectSearch
                value={status}
                onChange={(value: string) => {
                  setStatus(value);
                  setValue("status", value, { shouldValidate: true });
                }}
                options={statusOptions}
                placeholder="Select status"
              />
            }
            error={errors?.status}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2 p-2 border-t overflow-hidden">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Update Status</Button>
        </div>
      </form>
    </Modal>
  );
};
