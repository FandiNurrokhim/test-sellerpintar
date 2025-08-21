"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

import { branchSchema } from "@/schemas/organization/branch";
import { Input } from "@/components/atoms/Forms/Input";
import { FormField } from "@/components/templates/Forms/FormField";
import { Label } from "@/components/atoms/Forms/Label";
import { Button } from "@/components/atoms/Forms/Button";
import { LocationPickerMap } from "@/components/molecules/Map/LocationPickerMap";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import { X } from "lucide-react";
import { branchesApi } from "@/utils/apis/branches";

type BranchFormData = z.infer<typeof branchSchema>;

interface BranchEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: BranchFormData;
  onSuccess?: () => void; // opsional, jika ingin refresh data parent
}

export default function BranchEditModal({
  isOpen,
  onClose,
  branch,
  onSuccess,
}: BranchEditModalProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const organizationId = session?.organizationId;
  const headers: Record<string, string> = {};
  if (organizationId) headers["x-organization-id"] = organizationId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: branch,
  });

  useEffect(() => {
    if (organizationId) {
      setValue("organizationId", organizationId, {
        shouldValidate: true,
      });
    }
    if (userId) {
      setValue("createdBy", userId, { shouldValidate: true });
    }
  }, [organizationId, userId, setValue, isOpen]);
  
  const latitude = watch("location.latitude");
  const longitude = watch("location.longitude");

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setValue("location.latitude", isNaN(value) ? 0 : value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setValue("location.longitude", isNaN(value) ? 0 : value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const setLatLng = (lat: number, lng: number) => {
    setValue("location.latitude", lat, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("location.longitude", lng, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onFormSubmit = async (data: BranchFormData) => {
    try {
      const createdBy = branch.createdBy;

      // Pastikan users unik (tidak double)
      const users = Array.from(new Set([createdBy, userId]));

      const payload = {
        name: data.name,
        users,
        branchCode: data.branchCode,
        location: data.location,
      };

      if (!branch.id) {
        throw new Error("Branch ID is missing.");
      }
      await branchesApi.updateBranch(branch.id, payload);
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Branch updated successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
      reset();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update branch";
      await Swal.fire({
        icon: "error",
        title: "Failed",
        text: errorMessage,
      });
    }
  };

  const DEFAULT_LAT = -6.2088;
  const DEFAULT_LNG = 106.8456;

  return (
    <ModalSide isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 mb-4 pb-2 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold !font-sentient dark:text-white/80">Edit Branch</h2>
            <p className="text-sm text-gray-500">
              Update the branch details below.
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
            <h3 className="font-semibold text-gray-900 dark:text-white/80">Branch Information</h3>

            <FormField
              label={<Label htmlFor="name">Branch Name</Label>}
              input={
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter branch name"
                  className="w-full"
                />
              }
              error={errors.name}
            />

            <FormField
              label={<Label htmlFor="branchCode">Branch Code</Label>}
              input={
                <Input
                  id="branchCode"
                  {...register("branchCode")}
                  placeholder="Enter branch code"
                  className="w-full"
                />
              }
              error={errors.branchCode}
            />

            <div>
              <Label>Choose location from map or search</Label>
              <LocationPickerMap
                lat={latitude || DEFAULT_LAT}
                lng={longitude || DEFAULT_LNG}
                onChange={setLatLng}
              />
            </div>

            <div className="flex gap-6">
              <div className="w-1/2">
                <FormField
                  label={<Label htmlFor="latitude">Latitude</Label>}
                  input={
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={latitude ?? ""}
                      onChange={handleLatitudeChange}
                      className="w-full"
                      placeholder="Enter latitude"
                    />
                  }
                  error={errors.location?.latitude}
                />
              </div>
              <div className="w-1/2">
                <FormField
                  label={<Label htmlFor="longitude">Longitude</Label>}
                  input={
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={longitude ?? ""}
                      onChange={handleLongitudeChange}
                      className="w-full"
                      placeholder="Enter longitude"
                    />
                  }
                  error={errors.location?.longitude}
                />
              </div>
            </div>
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
