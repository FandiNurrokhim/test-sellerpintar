"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/atoms/Forms/Input";
import { FormField } from "@/components/templates/Forms/FormField";
import { Label } from "@/components/atoms/Forms/Label";
import { Button } from "@/components/atoms/Forms/Button";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import { SelectSearch } from "@/components/atoms/Forms/SelectSearch";
import { userApi } from "@/utils/apis/users";

import { X } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

interface UsersApiResponse {
  status: string;
  code: number;
  message: string;
  data: User[];
}

// Static permission options
const permissionOptions = [
  { label: "Create Users", value: "create:users" },
  { label: "Read Users", value: "read:users" },
  { label: "Update Users", value: "update:users" },
  { label: "Delete Users", value: "delete:users" },
  { label: "Create Products", value: "create:products" },
  { label: "Read Products", value: "read:products" },
  { label: "Update Products", value: "update:products" },
  { label: "Delete Products", value: "delete:products" },
  { label: "Create Orders", value: "create:orders" },
  { label: "Read Orders", value: "read:orders" },
  { label: "Update Orders", value: "update:orders" },
  { label: "Delete Orders", value: "delete:orders" },
  { label: "View Reports", value: "view:reports" },
  { label: "Manage Settings", value: "manage:settings" },
  { label: "Manage Roles", value: "manage:roles" },
  { label: "Manage Organization", value: "manage:organization" },
];

// Fixed schema - remove default values and make fields required in the schema
const roleFormSchema = z.object({
  scope: z.string().min(1, "Scope is required"),
  role: z.string().min(1, "Role name is required"),
  users: z.array(z.string()),
  deletable: z.boolean(),
  permission: z.array(z.string()).min(1, "At least one permission is required"),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    organizationId: string;
    branchId?: string;
    scope: string;
    role: string;
    users: string[];
    deletable: boolean;
    permission: string[];
  }) => void;
}

// Provide default values in the form configuration instead
const defaultValues: RoleFormData = {
  scope: "organization",
  role: "",
  users: [],
  deletable: true,
  permission: [],
};

export default function RoleFormModal({
  isOpen,
  onClose,
  onSubmit,
}: RoleFormModalProps) {
  const org = JSON.parse(sessionStorage.getItem("organization") || "{}");
  const organizationId = org.id;
  const branch = JSON.parse(sessionStorage.getItem("branch") || "{}");
  const branchId = branch.id;

  const [users, setUsers] = React.useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = (await userApi.getAll()) as UsersApiResponse;
        if (response.status === "success") {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues,
  });

  const watchedPermissions = watch("permission", []);
  const watchedUsers = watch("users", []);

  const userOptions = React.useMemo(() => {
    return users.map((user: User) => ({
      label: `${user.firstName} ${user.lastName} (${user.email})`,
      value: user.id,
    }));
  }, [users]);

  const onFormSubmit = (data: RoleFormData) => {
    const payload = {
      organizationId,
      ...(branchId && { branchId }),
      scope: data.scope,
      role: data.role,
      users: data.users,
      deletable: data.deletable,
      permission: data.permission,
    };

    onSubmit(payload);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <ModalSide isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 mb-4 pb-2 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold !font-sentient dark:text-white/80">Add Role</h2>
            <p className="text-sm text-gray-500">
              Fill in the details below to create a new role.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
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
              label={
                <Label className="!font-sentient" htmlFor="role">
                  Role Name
                </Label>
              }
              input={
                <Input
                  id="role"
                  {...register("role")}
                  placeholder="Enter role name (e.g., Admin, Manager)"
                  className="w-full"
                />
              }
              error={errors.role}
            />

            <FormField
              label={
                <Label className="!font-sentient" htmlFor="scope">
                  Scope
                </Label>
              }
              input={
                <Input
                  id="scope"
                  {...register("scope")}
                  placeholder="Enter scope (e.g., organization, branch)"
                  className="w-full"
                />
              }
              error={errors.scope}
            />

            <FormField
              label={
                <Label className="!font-sentient" htmlFor="permission">
                  Permissions
                </Label>
              }
              input={
                <SelectSearch
                  options={permissionOptions}
                  value={watchedPermissions}
                  onChange={(selectedPermissions) =>
                    setValue("permission", selectedPermissions, {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Select permissions"
                  isMultiple={true}
                  error={!!errors.permission}
                  errorMessage={errors.permission?.message}
                />
              }
              error={errors.permission?.message}
            />

            <FormField
              label={
                <Label className="!font-sentient" htmlFor="users">
                  Users - Optional
                </Label>
              }
              input={
                <SelectSearch
                  options={userOptions}
                  value={watchedUsers}
                  onChange={(selectedUsers) =>
                    setValue("users", selectedUsers, { shouldValidate: true })
                  }
                  placeholder={
                    loadingUsers ? "Loading users..." : "Select users"
                  }
                  isMultiple={true}
                  error={!!errors.users}
                  errorMessage={errors.users?.message}
                />
              }
              error={errors.users?.message}
            />

            <FormField
              label={
                <Label className="!font-sentient" htmlFor="deletable">
                  Deletable
                </Label>
              }
              input={
                <div className="flex items-center space-x-2">
                  <input
                    id="deletable"
                    type="checkbox"
                    {...register("deletable")}
                    className="rounded border-gray-300 text-blue-600 hover:text-blue-800 transition focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    Allow this role to be deleted
                  </span>
                </div>
              }
              error={errors.deletable}
            />

            {/* Display session info for reference */}
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <p className="text-gray-600">
                <strong>Organization:</strong> {org.name || organizationId}
              </p>
              {branchId && (
                <p className="text-gray-600">
                  <strong>Branch:</strong> {branch.name || branchId}
                </p>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-[#161618] py-4 border-t mt-2 flex justify-end gap-2 z-10">
            <Button variant="ghost" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create Role</Button>
          </div>
        </form>
      </div>
    </ModalSide>
  );
}
