"use client";

import React from "react";
import { Filter, UserCircle } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/atoms/Forms/Input";
import { Button } from "@/components/atoms/Forms/Button";
import WidgetHeader from "@/components/templates/WidgetHeader";
import DataTable from "@/components/organisms/Table/DataTable";
import ActionDropdown from "@/components/molecules/ActionDropdown";

import UserDetailModal from "@/app/(DashboardLayout)/dashboard/user-management/partials/user/detail";

import { User } from "@/schemas/organization/user";
import { userApi } from "@/utils/apis/users";

interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  status: string;
  code: number;
  message: string;
  data: ApiUser[];
  meta: {
    pagination: {
      totalItems: number;
      currentPage: number;
      perPage: number;
      totalPages: number;
    };
  };
}

export default function UserPage() {
  const [isDetailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const [users, setUsers] = React.useState<User[]>([]);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [totalItems, setTotalItems] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const pageSize = 10;

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = (await userApi.getAll({
        page: pageIndex + 1,
        perPage: pageSize,
      })) as ApiResponse;

      if (response.status === "success") {
        const mappedUsers: User[] = response.data.map((user: ApiUser) => ({
          ...user,
          fullName: `${user.firstName} ${user.lastName}`,
        }));

        setUsers(mappedUsers);
        setTotalItems(
          response.meta?.pagination?.totalItems || mappedUsers.length
        );
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: User) => alert(`Editing ${user.fullName}`);

  const handleDelete = async (user: User) => {
    if (confirm(`Delete ${user.fullName}?`)) {
      try {
        await userApi.delete(user.id);
        await fetchUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const totalUsers = totalItems;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = users.filter((u) => u.isActive === false).length;

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium text-gray-900">{row.original.fullName}</p>
            <p className="text-sm text-gray-500">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ getValue }) => (getValue() as string[]).join(", "),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean;
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <ActionDropdown<User>
          item={row.original}
          onView={() => {
            setSelectedUser(row.original);
            setDetailModalOpen(true);
          }}
          onEdit={() => handleEdit(row.original)}
          onDelete={() => handleDelete(row.original)}
        />
      ),
    },
  ];

  return (
    <>
      {selectedUser && (
        <UserDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          user={selectedUser}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-3 mb-8">
        <WidgetHeader
          variant="primary"
          title="Total Users"
          value={String(totalUsers)}
          icon={<UserCircle className="h-5 w-5 text-[#001363]" />}
        />
        <WidgetHeader
          title="Active Users"
          value={String(activeUsers)}
          icon={<UserCircle className="h-5 w-5 text-white" />}
          variant="default"
        />
        <WidgetHeader
          title="Inactive Users"
          value={String(inactiveUsers)}
          icon={<UserCircle className="h-5 w-5 text-white" />}
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
              onClick={() => alert("Filter users")}
            >
              <Filter className="size-4 text-[#151515] dark:text-white/80" />
              Filter
            </Button>
            <Input
              type="search"
              placeholder="Search users..."
              className="w-64 h-10"
            />
          </div>
          {/* <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 h-10"
            onClick={() => alert("Add new user")}
          >
            <Plus className="size-4" />
            Add User
          </Button> */}
        </div>

        <DataTable
          columns={columns}
          data={users}
          total={totalItems}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          isLoading={loading}
        />
      </div>
    </>
  );
}
