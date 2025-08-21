"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/atoms/Forms/Button";
import { Label } from "@/components/atoms/Forms/Label";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import type { Role } from "@/schemas/organization/role";

interface RoleDetailProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
}

export default function RoleDetailModal({
  isOpen,
  onClose,
  role,
}: RoleDetailProps) {
  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "-";

  return (
    <ModalSide isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 mb-4 pb-2 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold !font-sentient dark:text-white/80">Role Detail</h2>
            <p className="text-sm text-gray-500">
              View details about this role.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4">
          <h3 className="font-semibold text-gray-900 dark:text-white/80">Role Information</h3>

          <div>
            <Label className="!font-sentient">Role Name</Label>
            <div className="flex items-center gap-2  mt-2">
              <span className="inline-block rounded bg-blue-50 text-blue-700 px-2 py-1 text-sm font-medium">
                {role.name}
              </span>
            </div>
          </div>

          <div>
            <Label className="!font-sentient">Permissions</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {role.permissions.length > 0 ? (
                role.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="inline-block rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold shadow-sm"
                  >
                    {perm}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 italic">
                  No permissions assigned
                </span>
              )}
            </div>
          </div>

          <div>
            <Label className="!font-sentient">Created At</Label>
            <div className="flex items-center gap-2  mt-2">
              <span className="inline-block rounded bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium">
                {formatDate(role.createdAt)}
              </span>
            </div>
          </div>

          <div>
            <Label className="!font-sentient">Updated At</Label>
            <div className="flex items-center gap-2  mt-2">
              <span className="inline-block rounded bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium">
                {formatDate(role.updatedAt)}
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
