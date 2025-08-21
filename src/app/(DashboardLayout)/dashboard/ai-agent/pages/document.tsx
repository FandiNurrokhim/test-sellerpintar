"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useBranch } from "@/context/BranchContext";
import { Plus, Filter, Table } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import WidgetHeader from "@/components/templates/WidgetHeader";
import DataTable from "@/components/organisms/Table/DataTable";
import { Input } from "@/components/atoms/Forms/Input";
import { Button } from "@/components/atoms/Forms/Button";
import ActionDropdown from "@/components/molecules/ActionDropdown";
import { useSession } from "next-auth/react";

import DocumentStoreFormModal from "@/app/(DashboardLayout)/dashboard/ai-agent/partials/document/form";
import DocumentStoreDetailModal from "@/app/(DashboardLayout)/dashboard/ai-agent/partials/document/detail";

import type {
  AssistantDocument,
  AssistantDocumentStore,
} from "@/schemas/assistant/documentStore";
import { assistantApi } from "@/utils/apis/assistant";
import Swal from "sweetalert2";

export default function DocumentStorePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDocumentStore, setSelectedDocumentStore] =
    useState<AssistantDocument | null>(null);

  const { data: session } = useSession();
  const token = session?.user.accessToken;
  const organizationId = session?.organizationId;
  const { branchId } = useBranch();

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (organizationId) h["x-organization-id"] = organizationId;
    if (branchId) h["x-branch-id"] = branchId;
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  }, [organizationId, branchId, token]);

  const [documentStores, setDocumentStores] = useState<AssistantDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const fetchDocumentStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assistantApi.getAssistantsDocuments(true, {
        headers,
      });
      const data: AssistantDocumentStore[] = Array.isArray(
        res.data.documentStores
      )
        ? res.data.documentStores
        : [];

      const transformedData: AssistantDocument[] = data.map((store) => ({
        ...store,
        url: "",
      }));

      setDocumentStores(transformedData);
    } catch (err) {
      setDocumentStores([]);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message?: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Failed to fetch document",
      });
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchDocumentStores();
  }, [fetchDocumentStores, branchId]);

  useEffect(() => {
    fetchDocumentStores();
  }, [fetchDocumentStores]);

  const handleDelete = async (store: AssistantDocument) => {
    const result = await Swal.fire({
      title: `Delete document store "${store.name}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await assistantApi.deleteAssistantDocument(store.id, true, { headers });
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Document store has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchDocumentStores();
      } catch (err) {
        await Swal.fire({
          icon: "error",
          title: "Failed",
          text:
            typeof err === "object" &&
            err !== null &&
            "message" in err &&
            typeof (err as { message?: unknown }).message === "string"
              ? (err as { message: string }).message
              : "Failed to delete document store",
        });
      }
    }
  };

  const columns: ColumnDef<AssistantDocument>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-white/80">
              {row.original.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-white/60">
              {row.original.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ getValue }) => {
        const active = getValue() as boolean;
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      id: "action",
      header: "Actions",
      cell: ({ row }) => (
        <ActionDropdown<AssistantDocument>
          item={row.original}
          onView={() => {
            setSelectedDocumentStore(row.original);
            setIsDetailOpen(true);
          }}
          onEdit={() => {
            setSelectedDocumentStore(row.original);
            setIsEditOpen(true);
          }}
          onDelete={() => handleDelete(row.original)}
        />
      ),
    },
  ];

  const total = documentStores.length;
  const activeCount = documentStores.filter((a) => a.isActive).length;
  const inactiveCount = documentStores.filter((a) => !a.isActive).length;

  return (
    <>
      <DocumentStoreFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async () => {
          await fetchDocumentStores();
          setIsModalOpen(false);
        }}
      />

      <DocumentStoreFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={selectedDocumentStore}
        onSubmit={async () => {
          await fetchDocumentStores();
          setIsEditOpen(false);
        }}
        isEdit
      />

      {selectedDocumentStore && (
        <DocumentStoreDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          documentStore={selectedDocumentStore}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-3 mb-8">
        <WidgetHeader
          variant="primary"
          title="Total Document Stores"
          value={String(total)}
          icon={<Table className="h-5 w-5 text-[#001363]" />}
        />
        <WidgetHeader
          title="Active Document Stores"
          value={String(activeCount)}
          icon={<Table className="h-5 w-5 text-white" />}
          variant="default"
        />
        <WidgetHeader
          title="Inactive Document Stores"
          value={String(inactiveCount)}
          icon={<Table className="h-5 w-5 text-white" />}
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
              onClick={() => alert("Filter document stores")}
            >
              <Filter className="size-4 text-[#151515] dark:text-white/80" />
            </Button>
            <Input
              type="search"
              placeholder="Search document stores..."
              className="w-64 h-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 h-10"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="size-4" />
              Add Document
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={documentStores}
          total={documentStores.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          isLoading={loading}
          onPageChange={setPageIndex}
        />
      </div>
    </>
  );
}
