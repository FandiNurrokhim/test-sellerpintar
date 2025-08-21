"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useBranch } from "@/context/BranchContext";
import { Plus, Filter } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import DataTable from "@/components/organisms/Table/DataTable";
import { Input } from "@/components/atoms/Forms/Input";
import { Button } from "@/components/atoms/Forms/Button";
import ActionDropdown from "@/components/molecules/ActionDropdown";
import { useSession } from "next-auth/react";

import AssistantFormModal from "@/app/(DashboardLayout)/dashboard/ai-agent/partials/assistant/form";
import AssistantDetailModal from "@/app/(DashboardLayout)/dashboard/ai-agent/partials/assistant/detail";

import type { Assistant, Conversation } from "@/schemas/assistant/assistant";
import { assistantApi } from "@/utils/apis/assistant";
import Swal from "sweetalert2";

export default function AssistantPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(
    null
  );
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [pendingConversationId, setPendingConversationId] = useState<
    string | null
  >(null);

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

  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const handleSelectAssistant = useCallback(
    async (assistant: Assistant) => {
      setSelectedAssistant(assistant);
      setSelectedConversation(null);
      setLoading(true);
      try {
        const res = await assistantApi.getConversationByAssistant(
          assistant.id,
          true,
          { headers }
        );
        const data = Array.isArray(res.data.conversations)
          ? res.data.conversations
          : [];
        setConversations(data);
        if (data.length === 0) {
          setSelectedConversation(null);
        }
      } catch (err) {
        setConversations([]);
        setSelectedConversation(null);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text:
            err instanceof Error
              ? err.message
              : "Failed to fetch conversations",
        });
      } finally {
        setLoading(false);
      }
    },
    [headers]
  );

  const fetchAssistants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assistantApi.getAssistants(true, { headers });
      const data = Array.isArray(res.data.assistants)
        ? res.data.assistants
        : [];
      setAssistants(data);
      if (data[0]) {
        setSelectedAssistant(data[0]);
        await handleSelectAssistant(data[0]);
      } else {
        setSelectedAssistant(null);
        setConversations([]);
      }
    } catch (err) {
      setAssistants([]);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err instanceof Error ? err.message : "Failed to fetch assistants",
      });
    } finally {
      setLoading(false);
    }
  }, [headers, handleSelectAssistant]);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants, branchId]);

  useEffect(() => {
    if (
      pendingConversationId &&
      conversations.length > 0 &&
      (selectedConversation === null ||
        selectedConversation?.id === pendingConversationId)
    ) {
      const found = conversations.find((c) => c.id === pendingConversationId);
      if (found) {
        setSelectedConversation(found);
        setPendingConversationId(null);
      }
    }
  }, [pendingConversationId, conversations, selectedConversation]);

  const handleDelete = async (asst: Assistant) => {
    const result = await Swal.fire({
      title: `Delete assistant "${asst.name}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await assistantApi.deleteAssistant(asst.id, true, { headers });
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Assistant has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchAssistants();
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
              : "Failed to delete assistant",
        });
      }
    }
  };

  const columns: ColumnDef<Assistant>[] = [
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
      accessorKey: "Instructions",
      header: "Instructions",
      cell: ({ row }) => (
        <span className="text-xs text-gray-700 dark:text-white/70">
          {row.original.details?.instructions || "-"}
        </span>
      ),
    },
    {
      accessorKey: "Temperature",
      header: "Temperature",
      cell: ({ row }) => (
        <span className="text-xs text-gray-700 dark:text-white/70">
          {row.original.details?.temperature || "-"}
        </span>
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
        <ActionDropdown<Assistant>
          item={row.original}
          onView={() => {
            setSelectedAssistant(row.original);
            setIsDetailOpen(true);
          }}
          onEdit={() => {
            setSelectedAssistant(row.original);
            setIsEditOpen(true);
          }}
          onDelete={() => handleDelete(row.original)}
        />
      ),
    },
  ];
  return (
    <>
      <AssistantFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async () => {
          await fetchAssistants();
          setIsModalOpen(false);
        }}
      />

      <AssistantFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={selectedAssistant}
        onSubmit={async () => {
          await fetchAssistants();
          setIsModalOpen(false);
        }}
        isEdit
      />

      {selectedAssistant && (
        <AssistantDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          assistant={selectedAssistant}
        />
      )}

      <div className="p-10 rounded-2xl bg-white dark:bg-[#161618]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 h-10"
              onClick={() => alert("Filter assistants")}
            >
              <Filter className="size-4 text-[#151515] dark:text-white/80" />
            </Button>
            <Input
              type="search"
              placeholder="Search assistants..."
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
              Add Assistant
            </Button>
          </div>
        </div>

        {/* Perbaiki bagian ini */}
        <DataTable
          columns={columns}
          data={assistants}
          total={assistants.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          isLoading={loading}
        />
      </div>
    </>
  );
}
