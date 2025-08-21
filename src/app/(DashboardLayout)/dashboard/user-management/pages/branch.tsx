"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { branchesApi } from "@/utils/apis/branches";
import Swal from "sweetalert2";
import { Plus, Filter, MapPin } from "lucide-react";

import { Button } from "@/components/atoms/Forms/Button";
import { Input } from "@/components/atoms/Forms/Input";
import WidgetHeader from "@/components/templates/WidgetHeader";
import DataTable from "@/components/organisms/Table/DataTable";
import ActionDropdown from "@/components/molecules/ActionDropdown";

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

interface ErrorWithMessage {
  message: string;
}

import BranchForm from "@/app/(DashboardLayout)/dashboard/user-management/partials/branch/form";
import BranchEdit from "@/app/(DashboardLayout)/dashboard/user-management/partials/branch/edit";
import BranchDetail from "@/app/(DashboardLayout)/dashboard/user-management/partials/branch/detail";

export default function BranchPage() {
  const { data: session } = useSession();
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(
    null
  );
  const pageSize = 10;

  const fetchBranches = React.useCallback(async () => {
    if (!session?.organizationId) return;
    setLoading(true);
    try {
      const res = await branchesApi.getBranches(session.organizationId);
      setBranches(res.data || []);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      setBranches([]);
      await Swal.fire({
        icon: "error",
        title: "Failed to fetch branches",
        text: isErrorWithMessage(error)
          ? error.message
          : "An error occurred while fetching branches.",
      });
    } finally {
      setLoading(false);
    }
  }, [session?.organizationId]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleView = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDetailOpen(true);
  };
  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditOpen(true);
  };

  const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
    return (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as Record<string, unknown>).message === "string"
    );
  };

  const handleDelete = async (branch: Branch) => {
    const result = await Swal.fire({
      title: `Delete branch ${branch.name}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await branchesApi.deleteBranch(branch.id);
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Branch has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchBranches();
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Failed",
          text: isErrorWithMessage(error)
            ? error.message
            : "Failed to delete branch",
        });
      }
    }
  };
  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: "name",
      header: "Branch Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "organizationId",
      header: "Organization ID",
      cell: ({ row }) => <span>{row.original.organizationId}</span>,
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => <span>{row.original.createdBy}</span>,
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
        <ActionDropdown<Branch>
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
      <BranchForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchBranches}
      />
      {(selectedBranch ?? branches[0]) && (
        <BranchEdit
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          branch={selectedBranch ?? branches[0]}
          onSuccess={fetchBranches}
        />
      )}
      {(selectedBranch ?? branches[0]) && (
        <BranchDetail
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          branch={selectedBranch ?? branches[0]}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-2 mb-8">
        <WidgetHeader
          variant="primary"
          title="Total Branches"
          value={String(branches.length)}
          icon={<MapPin className="h-5 w-5 text-[#001363]" />}
        />
        <WidgetHeader
          title="Organizations"
          value={"1"}
          icon={<MapPin className="h-5 w-5 text-white" />}
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
              onClick={() => alert("Filter branches")}
            >
              <Filter className="size-4 text-[#151515] dark:text-white/80" />
              Filter
            </Button>
            <Input
              type="search"
              placeholder="Search branches..."
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
            Add Branch
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={branches}
          total={branches.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          isLoading={loading}
        />
      </div>
    </>
  );
}
