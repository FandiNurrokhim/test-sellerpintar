"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/atoms/Forms/Button";
import { Label } from "@/components/atoms/Forms/Label";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import type { User } from "@/schemas/organization/user";

interface UserDetailProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function UserDetailModal({
  isOpen,
  onClose,
  user,
}: UserDetailProps) {
  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "-";

  return (
    <ModalSide isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-200 mb-4 pb-2 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold !font-sentient dark:text-white/80">User Detail</h2>
            <p className="text-sm text-gray-500">
              View details about this user.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-4">
          <h3 className="font-semibold text-gray-900 dark:text-white/80">User Information</h3>

          <div>
            <Label className="!font-sentient">Full Name</Label>
            <span className="inline-block rounded bg-blue-50 text-blue-700 px-2 py-1 text-sm font-medium mt-2">
              {user.fullName}
            </span>
          </div>

          <div>
            <Label className="!font-sentient">Email</Label>
            <span className="inline-block rounded bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium mt-2">
              {user.email}
            </span>
          </div>

          <div>
            <Label className="!font-sentient">Status</Label>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold shadow-sm mt-2 ${
                user.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div>
            <Label className="!font-sentient">Roles</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.roles.length > 0 ? (
                user.roles.map((r) => (
                  <span
                    key={r}
                    className="inline-block rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold shadow-sm"
                  >
                    {r}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 italic">No roles assigned</span>
              )}
            </div>
          </div>

          <div>
            <Label className="!font-sentient">Created At</Label>
            <span className="inline-block rounded bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium mt-2">
              {formatDate(user.createdAt)}
            </span>
          </div>

          <div>
            <Label className="!font-sentient">Updated At</Label>
            <span className="inline-block rounded bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium mt-2">
              {formatDate(user.updatedAt)}
            </span>
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
