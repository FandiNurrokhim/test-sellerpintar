"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { useBranch } from "@/context/BranchContext";
import { FormField } from "@/components/templates/Forms/FormField";
import { SelectSearch } from "@/components/atoms/Forms/SelectSearch";
import { Input } from "@/components/atoms/Forms/Input";
import { Label } from "@/components/atoms/Forms/Label";
import { useZodForm } from "@/hooks/useZodForm";
import { useToast } from "@/components/atoms/ToastProvider";
import {
  businessInformationSchema,
  BusinessInformationFormData,
} from "@/schemas/initiateSetup/businessInformation";
import { LocationPickerMap } from "@/components/molecules/Map/LocationPickerMap";
import { businessApi } from "@/utils/apis/business";

type UserProfile = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
};

type Organization = {
  id: string;
  name: string;
  userId: string;
  users: string[];
  organizationCode: string;
  maxBranches: number;
  createdAt: string;
  updatedAt: string;
};

type Branch = {
  id: string;
  name: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  paymentInformation?: {
    accountName: string;
    accountCode: string;
    accountNumber: string;
  };
};

export interface BusinessDetailRef {
  submitForm: () => Promise<boolean>;
  isLoading: boolean;
}

interface BusinessDetailProps {
  onSubmitSuccess?: () => void;
}

const DEFAULT_LAT = -6.2088;
const DEFAULT_LNG = 106.8456;

const PAYMENT_OPTIONS = [
  { label: "Mandiri", value: "mandiri" },
  { label: "BCA", value: "bca" },
];

export const BusinessDetail = forwardRef<
  BusinessDetailRef,
  BusinessDetailProps
>(({ onSubmitSuccess }, ref) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [branch, setBranch] = useState<Branch | null>(null);
  const { branchId } = useBranch();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useZodForm(businessInformationSchema, {
    defaultValues: {
      name: "",
      latitude: -6.2,
      longitude: 106.8,
      paymentAccountName: "",
      paymentAccountCode: "",
      paymentAccountNumber: "",
    },
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  const handleLatitudeChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const value = parseFloat(raw);

      if (raw === "" || raw === "-") {
        setValue("latitude", 0, { shouldValidate: false, shouldDirty: true });
        return;
      }

      if (!isNaN(value) && value >= -90 && value <= 90) {
        setValue("latitude", value, {
          shouldValidate: true,
          shouldDirty: true,
        });
        await trigger("latitude");
      } else if (!isNaN(value)) {
        showToast("Latitude must be between -90 and 90", "error");
      }
    },
    [setValue, trigger, showToast]
  );

  const handleLongitudeChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const value = parseFloat(raw);

      if (raw === "" || raw === "-") {
        setValue("longitude", 0, { shouldValidate: false, shouldDirty: true });
        return;
      }

      if (!isNaN(value) && value >= -180 && value <= 180) {
        setValue("longitude", value, {
          shouldValidate: true,
          shouldDirty: true,
        });
        await trigger("longitude");
      } else if (!isNaN(value)) {
        showToast("Longitude must be between -180 and 180", "error");
      }
    },
    [setValue, trigger, showToast]
  );

  const setLatLng = useCallback(
    async (lat: number, lng: number) => {
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        showToast("Invalid coordinates selected", "error");
        return;
      }
      setValue("latitude", lat, { shouldValidate: true, shouldDirty: true });
      setValue("longitude", lng, { shouldValidate: true, shouldDirty: true });
      await trigger(["latitude", "longitude"]);
    },
    [setValue, trigger, showToast]
  );

  const fetchUserProfile = async (): Promise<UserProfile> => {
    const response = await businessApi.getUserProfile();
    return response.data;
  };

  const fetchOrganization = async (userId: string): Promise<Organization> => {
    const response = await businessApi.getOrganizations();
    const organizations = response.data;
    const userOrganization = organizations.find(
      (org: Organization) => org.userId === userId
    );
    if (!userOrganization) {
      throw new Error("No organization found for this user");
    }
    return userOrganization;
  };

  const fetchBranchById = async (id: string): Promise<Branch | null> => {
    try {
      const response = await businessApi.getBranchById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching branch by ID:", error);
      return null;
    }
  };

  const updateBranch = async (
    id: string,
    data: BusinessInformationFormData
  ) => {
    const updateData = {
      name: data.name,
      branchCode: `MAIN${Date.now()}`,
      isActive: true,
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      paymentInformation: {
        accountName: data.paymentAccountName,
        accountCode: data.paymentAccountCode,
        accountNumber: data.paymentAccountNumber,
      },
    };
    return businessApi.updateBranch(id, updateData);
  };

  const onSubmit = async (
    data: BusinessInformationFormData
  ): Promise<boolean> => {
    if (!branch) {
      showToast("No branch found to update", "error");
      return false;
    }
    setIsLoading(true);
    try {
      await updateBranch(branch.id, data);
      showToast("Business details updated successfully!", "success");
      sessionStorage.setItem("alreadySetupBranch", "true");
      onSubmitSuccess?.();
      return true;
    } catch (error) {
      console.error("Error updating branch:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to update business details",
        "error"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      const isFormValid = await trigger();
      if (!isFormValid) {
        showToast("Please fill in all required fields correctly", "error");
        return false;
      }
      return new Promise((resolve) => {
        handleSubmit(async (data) => {
          const success = await onSubmit(data);
          resolve(success);
        })();
      });
    },
    isLoading,
  }));

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        setBranch(null);

        const profile = await fetchUserProfile();
        await fetchOrganization(profile.userId);

        let currentBranch: Branch | null = null;
        if (branchId) {
          currentBranch = await fetchBranchById(branchId);
        }

        if (currentBranch) {
          setBranch(currentBranch);
          setValue("name", currentBranch.name);

          const hasLat = typeof currentBranch.location?.latitude === "number";
          const hasLng = typeof currentBranch.location?.longitude === "number";

          setValue(
            "latitude",
            hasLat ? currentBranch.location!.latitude : DEFAULT_LAT
          );
          setValue(
            "longitude",
            hasLng ? currentBranch.location!.longitude : DEFAULT_LNG
          );

          if (currentBranch.paymentInformation) {
            setValue(
              "paymentAccountName",
              currentBranch.paymentInformation.accountName || ""
            );
            setValue(
              "paymentAccountCode",
              currentBranch.paymentInformation.accountCode || ""
            );
            setValue(
              "paymentAccountNumber",
              currentBranch.paymentInformation.accountNumber || ""
            );
          }
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        showToast(
          error instanceof Error ? error.message : "Failed to load data",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [branchId, setValue, showToast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading business details...</p>
        </div>
      </div>
    );
  }

  return (
    <form>
      <div className="flex flex-col gap-6">
        <FormField
          label={
            <Label className="!font-sentient" htmlFor="name">
              Business Name
            </Label>
          }
          input={
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter your branch name"
              className="w-full"
            />
          }
          error={errors.name}
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
              error={errors.latitude}
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
              error={errors.longitude}
            />
          </div>
        </div>

        <hr />

        <div>
          <h2 className="text-2xl !font-sentient font-semibold mb-1 dark:text-white/80">
            Wallet
          </h2>
          <p className="text-[#A3AED0] text-sm mb-2 dark:text-white/60">
            Set up your payment account details to receive payments.
          </p>
        </div>

        <FormField
          label={
            <Label className="!font-sentient" htmlFor="paymentAccountName">
              Payment Account Name
            </Label>
          }
          input={
            <Input
              id="paymentAccountName"
              {...register("paymentAccountName")}
              placeholder="Enter payment account name"
              className="w-full"
            />
          }
          error={errors.paymentAccountName}
        />

        <FormField
          label={
            <Label className="!font-sentient" htmlFor="paymentAccountCode">
              Payment Account Code
            </Label>
          }
          input={
            <SelectSearch
              value={watch("paymentAccountCode") || ""}
              onChange={(value: string) =>
                setValue("paymentAccountCode", value)
              }
              options={PAYMENT_OPTIONS}
              placeholder="Select payment account code"
            />
          }
          error={errors.paymentAccountCode}
        />

        <FormField
          label={
            <Label className="!font-sentient" htmlFor="paymentAccountNumber">
              Payment Account Number
            </Label>
          }
          input={
            <Input
              id="paymentAccountNumber"
              {...register("paymentAccountNumber")}
              placeholder="Enter payment account number"
              className="w-full"
            />
          }
          error={errors.paymentAccountNumber}
        />
      </div>
    </form>
  );
});

BusinessDetail.displayName = "BusinessDetail";
