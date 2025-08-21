"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MessageSquare, Plus, Filter } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import HeaderTitlePage from "@/components/templates/HeaderTitlePage";
import WidgetHeader from "@/components/templates/WidgetHeader";
import DataTable from "@/components/organisms/Table/DataTable";
import { Input } from "@/components/atoms/Forms/Input";
import { Button } from "@/components/atoms/Forms/Button";
import { ConnectWhatsAppModal } from "./partials/connect";
import { WhatsAppModal } from "./partials/form";
import { EditWhatsAppModal } from "./partials/edit-form";
import { DetailWhatsAppModal } from "./partials/detail-form";

import { whatsAppApi } from "@/utils/apis/whatsapp";
import { WhatsAppSetting } from "@/types/whatsapp";
import { useToast } from "@/components/atoms/ToastProvider";
import ActionDropdown from "@/components/molecules/ActionDropdown";
import Swal from "sweetalert2";

type WhatsAppSettingWithIndex = WhatsAppSetting & {
  [key: string]: unknown;
};

export default function WhatsAppPage() {
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isReconnectModalOpen, setIsReconnectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editWhatsApp, setEditWhatsApp] =
    useState<WhatsAppSettingWithIndex | null>(null);
  const [selectedWhatsApp, setSelectedWhatsApp] =
    useState<WhatsAppSettingWithIndex | null>(null);
  const [whatsAppSettings, setWhatsAppSettings] = useState<
    WhatsAppSettingWithIndex[]
  >([]);
  const [filteredSettings, setFilteredSettings] = useState<
    WhatsAppSettingWithIndex[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWhatsAppSettings = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await whatsAppApi.getSettings();

      if (result && result.success && Array.isArray(result.data)) {
        const settingsWithIndex = result.data as WhatsAppSettingWithIndex[];
        setWhatsAppSettings(settingsWithIndex);
        setFilteredSettings(settingsWithIndex);
      } else {
        setWhatsAppSettings([]);
        setFilteredSettings([]);
      }
    } catch (error) {
      console.error("Failed to fetch WhatsApp settings:", error);
      showToast("Failed to fetch WhatsApp settings", "error");
      setWhatsAppSettings([]);
      setFilteredSettings([]);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const handleAddWhatsAppSuccess = useCallback(async () => {
    await fetchWhatsAppSettings();
  }, [fetchWhatsAppSettings]);

  const handleAddWhatsApp = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleEdit = useCallback((whatsApp: WhatsAppSettingWithIndex) => {
    setEditWhatsApp(whatsApp);
    setIsEditModalOpen(true);
  }, []);

  const handleEditSubmit = useCallback(async () => {
    setIsEditModalOpen(false);
    setEditWhatsApp(null);
    await fetchWhatsAppSettings();
  }, [fetchWhatsAppSettings]);

  const handleDelete = useCallback(
    async (whatsApp: WhatsAppSettingWithIndex) => {
      if (
        await Swal.fire({
          title: "Are you sure?",
          text: `You are about to delete "${whatsApp.name}". This action cannot be undone.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel",
        }).then((result) => result.isConfirmed)
      ) {
        try {
          setIsLoading(true);
          await whatsAppApi.deleteSetting(whatsApp.id);
          showToast("WhatsApp setting deleted successfully", "success");
          await fetchWhatsAppSettings();
        } catch (error) {
          console.error("Failed to delete WhatsApp setting:", error);
          showToast("Failed to delete WhatsApp setting", "error");
        } finally {
          setIsLoading(false);
        }
      }
    },
    [fetchWhatsAppSettings, showToast]
  );

  const handleConnectSuccess = useCallback(async () => {
    setIsConnectModalOpen(false);
    showToast("WhatsApp connection initiated", "success");
    await fetchWhatsAppSettings();
  }, [showToast, fetchWhatsAppSettings]);

  const handleConnectModalClose = useCallback(async () => {
    setIsConnectModalOpen(false);
    await fetchWhatsAppSettings();
  }, [fetchWhatsAppSettings]);

  const handleConnect = useCallback(
    async (whatsApp: WhatsAppSettingWithIndex) => {
      setSelectedWhatsApp(whatsApp);
      setIsConnectModalOpen(true);
    },
    []
  );

  const handleView = useCallback((whatsApp: WhatsAppSettingWithIndex) => {
    setSelectedWhatsApp(whatsApp);
    setIsDetailModalOpen(true);
  }, []);

  const handleDetailEdit = useCallback(() => {
    if (selectedWhatsApp) {
      setIsDetailModalOpen(false);
      setEditWhatsApp(selectedWhatsApp);
      setIsEditModalOpen(true);
    }
  }, [selectedWhatsApp]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setFilteredSettings(whatsAppSettings);
      } else {
        const filtered = whatsAppSettings.filter(
          (setting) =>
            setting.name.toLowerCase().includes(query.toLowerCase()) ||
            setting.assistantName.toLowerCase().includes(query.toLowerCase()) ||
            setting.phoneNumber.includes(query)
        );
        setFilteredSettings(filtered);
      }
    },
    [whatsAppSettings]
  );

  const handleDisconnect = useCallback(
    async (whatsApp: WhatsAppSettingWithIndex) => {
      if (
        await Swal.fire({
          title: "Are you sure?",
          text: `You are about to disconnect "${whatsApp.name}". This action cannot be undone.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, disconnect it!",
          cancelButtonText: "No, cancel",
        }).then((result) => result.isConfirmed)
      ) {
        try {
          setIsLoading(true);
          await whatsAppApi.disconnect(whatsApp.id);
          showToast("WhatsApp disconnected successfully", "success");
          await fetchWhatsAppSettings();
        } catch (error) {
          console.error("Failed to disconnect WhatsApp setting:", error);
          showToast("Failed to disconnect WhatsApp setting", "error");
        } finally {
          setIsLoading(false);
        }
      }
    },
    [fetchWhatsAppSettings, showToast]
  );

  const handleReconnect = useCallback(
    async (whatsApp: WhatsAppSettingWithIndex) => {
      const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to reconnect "${whatsApp.name}". This action will attempt to re-establish the connection.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, reconnect it!",
        cancelButtonText: "No, cancel",
      }).then((r) => r.isConfirmed);

      if (!confirmed) return;

      try {
        setIsLoading(true);
        setSelectedWhatsApp(whatsApp);
        setIsConnectModalOpen(true);
        setIsReconnectModalOpen(true);
      } catch (error) {
        console.error("Failed to reconnect WhatsApp setting:", error);
        showToast("Failed to reconnect WhatsApp setting", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    fetchWhatsAppSettings();
  }, [fetchWhatsAppSettings]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "CONNECTED":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "CONNECTING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "INACTIVE":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
      case "DISCONNECTED":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "PENDING":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "UNAUTHORIZED":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "ACTIVE":
        return "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300";
      case "ERROR":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  }, []);

  const columns: ColumnDef<WhatsAppSettingWithIndex>[] = [
    {
      accessorKey: "name",
      header: "Bot Name",
      cell: ({ row }) => {
        const status = row.original.botStatus;

        let bgColor = "bg-gray-100 dark:bg-[#232336]";
        if (status === "ACTIVE") {
          bgColor = "bg-green-200 dark:bg-green-900/30";
        } else if (status === "DISCONNECTED") {
          bgColor = "bg-red-100 dark:bg-red-900/30";
        }

        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}
            >
              <MessageSquare
                className={`w-5 h-5 ${
                  status === "ACTIVE"
                    ? "text-green-500"
                    : status === "DISCONNECTED"
                    ? "text-red-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {row.original.name}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-gray-100 dark:bg-[#232336] text-gray-700 dark:text-gray-300 rounded text-sm">
          {row.original.phoneNumber || "Not Connected"}
        </span>
      ),
    },
    {
      accessorKey: "botStatus",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "assistantName",
      header: "Assistant",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-gray-100 dark:bg-[#232336] text-gray-700 dark:text-gray-300 rounded text-sm">
          {row.original.assistantName}
        </span>
      ),
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const additionalActions =
          row.original.botStatus === "INACTIVE" ||
          row.original.botStatus === "ERROR" ||
          row.original.botStatus === "DISCONNECTED"
            ? [
                {
                  label: "Connect",
                  className: "!text-green-700 !dark:text-green-400",
                  onClick:
                    row.original.botStatus === "DISCONNECTED"
                      ? handleReconnect
                      : handleConnect,
                },
              ]
            : [
                {
                  label: "Reconnect",
                  className: "!text-blue-700 !dark:text-blue-400",
                  onClick: () => handleReconnect(row.original),
                },
                {
                  label: "Disconnect",
                  className: "!text-red-700 !dark:text-red-400",
                  onClick: () => handleDisconnect(row.original),
                },
              ];

        return (
          <div className="flex gap-2 justify-left">
            <ActionDropdown<WhatsAppSettingWithIndex>
              item={row.original}
              onView={handleView}
              onEdit={handleEdit}
              additionalActions={additionalActions}
              onDelete={handleDelete}
            />
          </div>
        );
      },
    },
  ];

  const totalBots = whatsAppSettings.length;
  const connectedBots = whatsAppSettings.filter(
    (s) => s.botStatus === "CONNECTED"
  ).length;
  const activeBots = whatsAppSettings.filter((s) => s.isActive).length;
  const disconnectedBots = whatsAppSettings.filter(
    (s) => s.botStatus === "DISCONNECTED"
  ).length;

  return (
    <>
      <WhatsAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddWhatsApp}
        onSuccess={handleAddWhatsAppSuccess}
      />

      <ConnectWhatsAppModal
        isReconnect={isReconnectModalOpen}
        isOpen={isConnectModalOpen}
        onClose={handleConnectModalClose}
        whatsApp={selectedWhatsApp}
        onSubmit={handleConnect}
        onSuccess={handleConnectSuccess}
      />

      <DetailWhatsAppModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedWhatsApp(null);
        }}
        whatsApp={selectedWhatsApp}
        onEdit={handleDetailEdit}
      />

      <EditWhatsAppModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditWhatsApp(null);
        }}
        whatsApp={editWhatsApp}
        onSubmit={handleEditSubmit}
      />

      <HeaderTitlePage
        title="WhatsApp Configurations"
        description="Manage your WhatsApp bot integrations here. You can create new bot connections, edit existing configurations, monitor connection status, and manage assistant assignments for automated customer support."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <WidgetHeader
          variant="primary"
          title="Total Bots"
          value={String(totalBots)}
          icon={<MessageSquare className="h-5 w-5 text-[#001363]" />}
        />
        <WidgetHeader
          title="Connected Bots"
          value={String(connectedBots)}
          icon={<MessageSquare className="h-5 w-5 text-[#FFF]" />}
          variant="default"
        />
        <WidgetHeader
          title="Active Bots"
          value={String(activeBots)}
          icon={<MessageSquare className="h-5 w-5 text-[#FFF]" />}
          variant="default"
        />
        <WidgetHeader
          title="Disconnected Bots"
          value={String(disconnectedBots)}
          icon={<MessageSquare className="h-5 w-5 text-[#FFF]" />}
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
              onClick={() => alert("Filter WhatsApp bots")}
              disabled={isLoading}
            >
              <Filter className="size-4 text-[#151515] dark:text-white/80" />
            </Button>
            <Input
              type="search"
              placeholder="Search bots..."
              className="w-64 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 h-10"
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading}
          >
            <Plus className="size-4" />
            Add Config
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={filteredSettings}
          total={filteredSettings.length}
          pageIndex={0}
          pageSize={filteredSettings.length || 1}
          onPageChange={() => {}}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
