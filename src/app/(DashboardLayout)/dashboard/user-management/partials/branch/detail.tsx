"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/atoms/Forms/Button";
import { Label } from "@/components/atoms/Forms/Label";
import { LocationPickerMap } from "@/components/molecules/Map/LocationPickerMap";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import type { Branch } from "@/schemas/organization/branch";

interface BranchDetailProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch;
}

export default function BranchDetailModal({
  isOpen,
  onClose,
  branch,
}: BranchDetailProps) {
  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "-";
  const DEFAULT_LAT = -6.2088;
  const DEFAULT_LNG = 106.8456;

  return (
    <ModalSide isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 mb-4 pb-2 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold !font-sentient dark:text-white/80">Branch Detail</h2>
            <p className="text-sm text-gray-500">
              View details about this branch.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4">
          <h3 className="font-semibold text-gray-900 dark:text-white/80">Branch Information</h3>

          <div>
            <Label className="!font-sentient">Branch Name</Label>
            <div className="flex items-center gap-2  mt-2">
              <span className="inline-block rounded bg-blue-50 text-blue-700 px-2 py-1 text-sm font-medium">
                {branch.name}
              </span>
            </div>
          </div>

          <div>
            <Label className="!font-sentient">Branch Code</Label>
            <div className="flex items-center gap-2  mt-2">
              <span className="inline-block rounded bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium">
                {branch.branchCode}
              </span>
            </div>
          </div>

          <div>
            <Label>Location On Map</Label>
            <LocationPickerMap
              lat={branch.location?.latitude || DEFAULT_LAT}
              lng={branch.location?.longitude || DEFAULT_LNG}
              onChange={() => {}}
            />
          </div>

          <div className="flex gap-6">
            <div className="w-1/2">
              <Label htmlFor="latitude">Latitude</Label>
              <div className="mt-2">
                <input
                  id="latitude"
                  type="number"
                  value={branch.location?.latitude ?? ""}
                  className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1"
                  readOnly
                />
              </div>
            </div>
            <div className="w-1/2">
              <Label htmlFor="longitude">Longitude</Label>
              <div className="mt-2">
                <input
                  id="longitude"
                  type="number"
                  value={branch.location?.longitude ?? ""}
                  className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="!font-sentient">Organization ID</Label>
            <div className="flex items-center gap-2  mt-2">
              <span className="inline-block rounded bg-indigo-100 text-indigo-700 px-2 py-1 text-xs font-semibold shadow-sm">
                {branch.organizationId}
              </span>
            </div>
          </div>

          <div>
            <Label className="!font-sentient">Created By</Label>
            <div className="flex items-center gap-2  mt-2">
              <span className="inline-block rounded bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium">
                {branch.createdBy}
              </span>
            </div>
          </div>

          <div>
            <Label className="!font-sentient">Created At</Label>
            <div className="flex items-center gap-2  mt-2">
              <span className="inline-block rounded bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium">
                {formatDate(branch.createdAt)}
              </span>
            </div>
          </div>

          <div>
            <Label className="!font-sentient">Updated At</Label>
            <div className="flex items-center gap-2  mt-2">
              <span className="inline-block rounded bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium">
                {formatDate(branch.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-[#161618] py-4 border-t mt-2 flex justify-end z-10">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </ModalSide>
  );
}
