"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Filter, ShieldCheck } from "lucide-react";

import { Button } from "@/components/atoms/Forms/Button";
import { Input } from "@/components/atoms/Forms/Input";
import WidgetHeader from "@/components/templates/WidgetHeader";
import DataTable from "@/components/organisms/Table/DataTable";
import ActionDropdown from "@/components/molecules/ActionDropdown";
import { Role } from "@/schemas/organization/role";
import { rolesApi } from "@/utils/apis/roles";
import RoleDetailModal from "../partials/role/detail";
import RoleEditModal from "../partials/role/edit";
import RoleFormModal from "../partials/role/form";

interface ApiRoleData {
  id: string;
  organizationId: string;
  branchId?: string;
  scope: string;
  role: string;
  users: string[];
  deletable: boolean;
  permission: string[];
  createdAt: string;
  updatedAt: string;
}

interface RoleFormData {
  organizationId: string;
  branchId?: string;
  scope: string;
  role: string;
  users: string[];
  deletable: boolean;
  permission: string[];
}

interface RoleUpdateData {
  name: string;
  permissions: string[];
  organizationId: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function RolesPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);

  const [roles, setRoles] = React.useState<Role[]>([]);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const pageSize = 10;

  const org = JSON.parse(sessionStorage.getItem("organization") || "{}");
  const branch = JSON.parse(sessionStorage.getItem("branch") || "{}");

  const organizationId = org.id;
  const branchId = branch.id;

  const getCustomHeaders = React.useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};

    if (organizationId) {
      headers["X-Organization-Id"] = organizationId;
    }

    if (branchId) {
      headers["X-Branch-Id"] = branchId;
    }

    return headers;
  }, [organizationId, branchId]);

  const fetchRoles = React.useCallback(async () => {
    if (!organizationId) {
      console.error("Organization ID not found. Cannot fetch roles.");
      return;
    }

    try {
      setLoading(true);
      const response = await rolesApi.getAll(
        organizationId,
        true,
        {},
        getCustomHeaders()
      );

      const mappedRoles: Role[] = response.data.map((apiRole: ApiRoleData) => ({
        id: apiRole.id,
        organizationId: apiRole.organizationId,
        branchId: apiRole.branchId,
        scope: apiRole.scope,
        name: apiRole.role,
        users: apiRole.users,
        deletable: apiRole.deletable,
        permissions: apiRole.permission,
        createdAt: apiRole.createdAt,
        updatedAt: apiRole.updatedAt,
      }));
      setRoles(mappedRoles);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  }, [organizationId, getCustomHeaders]);

  React.useEffect(() => {
    if (organizationId) {
      fetchRoles();
    }
  }, [fetchRoles, organizationId]);

  const handleView = async (role: Role) => {
    try {
      const response = await rolesApi.getById(
        role.id,
        true,
        {},
        getCustomHeaders()
      );
      const mappedRole: Role = {
        id: response.data.id,
        organizationId: response.data.organizationId,
        name: response.data.role,
        permissions: response.data.permission,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      };
      setSelectedRole(mappedRole);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Failed to fetch role details:", error);
    }
  };

  const handleEdit = async (role: Role) => {
    try {
      const response = await rolesApi.getById(
        role.id,
        true,
        {},
        getCustomHeaders()
      );
      const mappedRole: Role = {
        id: response.data.id,
        organizationId: response.data.organizationId,
        name: response.data.role,
        permissions: response.data.permission,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      };
      setSelectedRole(mappedRole);
      setIsEditOpen(true);
    } catch (error) {
      console.error("Failed to fetch role details:", error);
    }
  };

  const handleDelete = async (role: Role) => {
    if (window.confirm(`Delete role ${role.name}?`)) {
      try {
        await rolesApi.delete(role.id, true, {}, getCustomHeaders());
        await fetchRoles();
      } catch (error) {
        console.error("Failed to delete role:", error);
      }
    }
  };

  const handleFormSubmit = async (data: RoleFormData) => {
    if (!organizationId) {
      console.error("Organization ID not found. Cannot create role.");
      return;
    }
    try {
      const payload = {
        organizationId: data.organizationId,
        branchId: data.branchId,
        scope: data.scope,
        role: data.role,
        users: data.users || [],
        deletable: data.deletable ?? true,
        permission: data.permission,
      };

      await rolesApi.create(
        organizationId,
        payload,
        true,
        {},
        getCustomHeaders()
      );
      await fetchRoles();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to create role:", error);
    }
  };

  const handleEditSubmit = async (data: RoleUpdateData) => {
    if (!selectedRole) return;

    try {
      const updatePayload = {
        role: data.name, // Map name to role
        users: [], // Default empty array since Role interface doesn't have users
        deletable: true, // Default to true since Role interface doesn't have deletable
        permission: data.permissions, // Map permissions to permission
      };

      await rolesApi.update(
        selectedRole.id,
        updatePayload,
        true,
        {},
        getCustomHeaders()
      );
      await fetchRoles();
      setIsEditOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: "Role Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ getValue }) =>
        (getValue() as string[]).map((perm) => (
          <span
            key={perm}
            className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-1 px-2 py-0.5 rounded"
          >
            {perm}
          </span>
        )),
    },
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <ActionDropdown<Role>
          item={row.original}
          onView={() => handleView(row.original)}
          onEdit={() => handleEdit(row.original)}
          onDelete={() => handleDelete(row.original)}
        />
      ),
    },
  ];

  return (
    <>
      <RoleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {selectedRole && (
        <RoleEditModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedRole(null);
          }}
          onSubmit={handleEditSubmit}
          role={selectedRole}
        />
      )}

      {selectedRole && (
        <RoleDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-2 mb-8">
        <WidgetHeader
          variant="primary"
          title="Total Roles"
          value={String(roles.length)}
          icon={<ShieldCheck className="h-5 w-5 text-[#001363]" />}
        />
        <WidgetHeader
          title="Organizations"
          value={"1"}
          icon={<ShieldCheck className="h-5 w-5 text-white" />}
          variant="default"
        />
      </div>

      <div className="p-10 rounded-2xl bg-white dark:bg-[#161618]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 h-10"
              onClick={() => console.log("Filter roles")}
            >
              <Filter className="size-4 text-[#151515] dark:text-white/80" />
              Filter
            </Button>
            <Input
              type="search"
              placeholder="Search roles..."
              className="w-64 h-10"
            />
          </div>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 h-10"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="size-4" />
            Add Role
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={roles}
          total={roles.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          isLoading={loading}
        />
      </div>
    </>
  );
}
