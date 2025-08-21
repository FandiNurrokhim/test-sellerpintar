"use client";

import React, {  useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { branchesApi } from "@/utils/apis/branches";

import { Input } from "@/components/atoms/Forms/Input";
import { FormField } from "@/components/templates/Forms/FormField";
import { Label } from "@/components/atoms/Forms/Label";
import { Button } from "@/components/atoms/Forms/Button";
import { LocationPickerMap } from "@/components/molecules/Map/LocationPickerMap";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import Swal from "sweetalert2";

import { branchSchema } from "@/schemas/organization/branch";
import { X } from "lucide-react";

type BranchFormData = z.infer<typeof branchSchema>;

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const defaultValues: BranchFormData = {
  name: "",
  organizationId: "",
  branchCode: "",
  createdBy: "",
  location: {
    latitude: 0,
    longitude: 0,
  },
};

export default function BranchFormModal({
  isOpen,
  onClose,
  onSuccess,
}: BranchFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues,
  });

  const { data: session } = useSession();
  const userId = session?.user?.id;
  const organizationId = session?.organizationId;
  const latitude = watch("location.latitude");
  const longitude = watch("location.longitude");

  useEffect(() => {
    if (organizationId) {
      setValue("organizationId", organizationId, {
        shouldValidate: true,
      });
    }
    if (userId) {
      setValue("createdBy", userId, {
        shouldValidate: true,
      });
    }
  }, [organizationId, userId, setValue, isOpen]);

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
      const payload = {
        ...data,
        createdBy: userId,
        organizationId: organizationId,
      };

      if (!organizationId) {
        throw new Error("Organization ID is required to create a branch.");
      }
      await branchesApi.createBranch(organizationId, payload);
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Branch created successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
      reset(defaultValues);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to create branch";
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
            <h2 className="text-lg font-bold !font-sentient dark:text-white/80">Add Branch</h2>
            <p className="text-sm text-gray-500">
              Fill in the details below to create a new branch.
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
              label={
                <Label className="!font-sentient" htmlFor="name">
                  Branch Name
                </Label>
              }
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
              label={
                <Label className="!font-sentient" htmlFor="branchCode">
                  Branch Code
                </Label>
              }
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
                  label={
                    <Label className="!font-sentient" htmlFor="latitude">
                      Latitude
                    </Label>
                  }
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
                  label={
                    <Label className="!font-sentient" htmlFor="longitude">
                      Longitude
                    </Label>
                  }
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
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </ModalSide>
  );
}
