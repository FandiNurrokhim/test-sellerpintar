"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Filter, Shield } from "lucide-react";

import { Button } from "@/components/atoms/Forms/Button";
import { Input } from "@/components/atoms/Forms/Input";
import WidgetHeader from "@/components/templates/WidgetHeader";
import DataTable from "@/components/organisms/Table/DataTable";
import ActionDropdown from "@/components/molecules/ActionDropdown";

import { BranchRole } from "@/schemas/organization/role";
import { branchRolesApi } from "@/utils/apis/branchRoles";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface BranchRolesResponse extends ApiResponse {
  data?: BranchRole[];
}

interface BranchRoleResponse extends ApiResponse {
  data?: BranchRole;
}

export default function BranchRolePage() {
  const [roles, setRoles] = React.useState<BranchRole[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const pageSize = 10;
  const branch = JSON.parse(sessionStorage.getItem("branch") || "{}");

  const branchId = branch.id;

  const fetchRoles = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await branchRolesApi.getAll(
        branchId
      )) as BranchRolesResponse;

      if (response.success) {
        setRoles(response.data || []);
      } else {
        const errorMessage =
          response.message || response.error || "Failed to fetch roles";
        setError(errorMessage);
        console.error("Failed to fetch roles:", errorMessage);
      }
    } catch (err) {
      const errorMessage = "An error occurred while fetching roles";
      setError(errorMessage);
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  React.useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleView = async (role: BranchRole) => {
    try {
      const response = (await branchRolesApi.getById(
        role.id
      )) as BranchRoleResponse;
      if (response.success && response.data) {
        alert(
          `Viewing: ${role.name}\nDetails: ${JSON.stringify(
            response.data,
            null,
            2
          )}`
        );
      } else {
        alert(
          `Failed to fetch details for: ${role.name}\nError: ${
            response.message || response.error
          }`
        );
      }
    } catch (err) {
      alert(`Error viewing role: ${role.name}`);
      console.error("Error viewing role:", err);
    }
  };

  const handleEdit = (role: BranchRole) => {
    alert(
      `Edit functionality for: ${role.name}\nImplement edit modal/form here`
    );
  };

  const handleDelete = async (role: BranchRole) => {
    if (!confirm(`Are you sure you want to delete "${role.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = (await branchRolesApi.delete(role.id)) as ApiResponse;

      if (response.success) {
        setRoles((prev) => prev.filter((r) => r.id !== role.id));
        alert(`Successfully deleted: ${role.name}`);
      } else {
        alert(
          `Failed to delete: ${role.name}\nError: ${
            response.message || response.error
          }`
        );
      }
    } catch (err) {
      alert(`Error deleting role: ${role.name}`);
      console.error("Error deleting role:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    alert(
      "Add new branch role functionality\nImplement create modal/form here"
    );
  };

  const handleFilter = () => {
    alert("Filter functionality\nImplement filter dropdown/modal here");
  };

  const filteredRoles = React.useMemo(() => {
    if (!searchTerm) return roles;

    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.permissions.some((perm) =>
          perm.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [roles, searchTerm]);

  const columns: ColumnDef<BranchRole>[] = [
    {
      accessorKey: "name",
      header: "Role Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.name}</span>
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
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <ActionDropdown<BranchRole>
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-2 mb-8">
        <WidgetHeader
          variant="primary"
          title="Total Branch Roles"
          value={String(roles.length)}
          icon={<Shield className="h-5 w-5 text-[#001363]" />}
        />
        <WidgetHeader
          title="Organizations"
          value={"1"}
          icon={<Shield className="h-5 w-5 text-white" />}
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
              onClick={handleFilter}
              disabled={loading}
            >
              <Filter className="size-4 text-[#151515] dark:text-white/80" />
              Filter
            </Button>
            <Input
              type="search"
              placeholder="Search branch roles..."
              className="w-64 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 h-10"
            onClick={handleAddRole}
            disabled={loading}
          >
            <Plus className="size-4" />
            Add Branch Role
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p>Loading roles...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredRoles}
            total={filteredRoles.length}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPageChange={setPageIndex}
          />
        )}
      </div>
    </>
  );
}
