"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useBranch } from "@/context/BranchContext";
import {
  Package,
  Filter,
  Clock,
  CheckCircle2,
  Loader2,
  Truck,
  Send,
  XCircle,
  Ban,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";

import HeaderTitlePage from "@/components/templates/HeaderTitlePage";
import WidgetHeader from "@/components/templates/WidgetHeader";
import DataTable from "@/components/organisms/Table/DataTable";
import { Input } from "@/components/atoms/Forms/Input";
import { Button } from "@/components/atoms/Forms/Button";
import { EditOrderStatusModal } from "./partials/edit-form";
import { DetailOrderModal } from "./partials/detail-form";

import { orderApi } from "@/utils/apis/orders";
import { Order, OrdersResponse, OrderStatus } from "@/schemas/order/order";
import { useToast } from "@/components/atoms/ToastProvider";
import ActionDropdown from "@/components/molecules/ActionDropdown";
import { ConfirmOrderModal } from "./partials/confirm-form";

export default function OrdersPage() {
  const { showToast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

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

  const fetchOrders = useCallback(
    async (page: number = 1): Promise<void> => {
      setLoading(true);
      try {
        const result = (await orderApi.getAll(
          {
            page,
            perPage: pageSize,
          },
          true,
          {},
          headers
        )) as OrdersResponse;

        const ordersArray = result?.data?.orders;

        if (result && Array.isArray(ordersArray)) {
          const orders: Order[] = ordersArray.map((order) => ({
            ...order,
            items: order.items ?? [],
          }));

          setOrders(orders);
          setTotalItems(result.data.total);
        } else {
          console.warn(
            "[OrdersPage] No orders returned or invalid structure:",
            result
          );
          setOrders([]);
          setTotalItems(0);
        }
      } catch (err) {
        console.error("[OrdersPage] Failed to fetch orders:", err);
        showToast(
          "Gagal mengambil data pesanan: " + (err as Error).message,
          "error"
        );
        setOrders([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    [headers, pageSize, showToast]
  );

  useEffect(() => {
    if (headers.Authorization) {
      const currentPage = pageIndex === 0 ? 1 : pageIndex + 1;
      fetchOrders(currentPage);
    }
  }, [branchId, pageIndex, headers.Authorization, fetchOrders]);

  const handleEdit = (order: Order) => {
    setEditOrder(order);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    setIsEditModalOpen(false);
    setEditOrder(null);
    fetchOrders(pageIndex + 1);
  };

  const handleCancel = async (order: Order) => {
    const result = await Swal.fire({
      title: `Cancel order "${order.orderNumber}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      try {
        await orderApi.cancel(order.id, true, {
          headers,
        });
        showToast("Order canceled successfully", "success");
        fetchOrders(pageIndex + 1);
      } catch (err) {
        showToast("Failed to cancel order" + (err as Error).message, "error");
      }
    }
  };

  const handleDelivered = async (order: Order) => {
    const result = await Swal.fire({
      title: `Mark order "${order.orderNumber}" as delivered?`,
      text: "This will update the order status to delivered.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, mark as delivered!",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      try {
        await orderApi.updateStatus(order.id, { status: "DELIVERED" }, true, {
          headers,
        });
        showToast("Order marked as delivered successfully", "success");
        fetchOrders(pageIndex + 1);
      } catch (err) {
        showToast(
          "Failed to mark order as delivered: " + (err as Error).message,
          "error"
        );
      }
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleConfirmSuccess = useCallback(() => {
    fetchOrders(pageIndex + 1);
  }, [fetchOrders, pageIndex]);

  const paginatedData = orders;

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order Number",
      cell: ({ row }) => row.original.orderNumber,
    },
    {
      accessorKey: "items",
      header: "Order Items",
      cell: ({ row }) => (
        <ul>
          {row.original.items.map((item) => (
            <li key={item.productVariantId}>
              {item.metadata?.productName || "-"} - {item.quantity} pcs
            </li>
          ))}
        </ul>
      ),
    },
    {
      accessorKey: "customerDetails",
      header: "Customer Detail",
      cell: ({ row }) => {
        const c = row.original.customerDetails;
        return (
          <div>
            <div className="font-semibold">{c.name}</div>
            <div className="text-xs text-gray-500">{c.phone}</div>
            <div className="text-xs text-gray-500">{c.email}</div>
            <div className="text-xs text-gray-500">{c.address}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const statusConfig: Record<
          OrderStatus,
          { label: string; color: string }
        > = {
          CREATED: { label: "CREATED", color: "bg-gray-100 text-gray-700" },
          AWAITING_PAYMENT: {
            label: "AWAITING_PAYMENT",
            color: "bg-yellow-100 text-yellow-700",
          },
          UNPAID: { label: "UNPAID", color: "bg-orange-100 text-orange-700" },
          PAID: { label: "PAID", color: "bg-green-100 text-green-700" },
          PROCESSING: {
            label: "PROCESSING",
            color: "bg-blue-100 text-blue-700",
          },
          SHIPPED: { label: "SHIPPED", color: "bg-indigo-100 text-indigo-700" },
          DELIVERED: { label: "DELIVERED", color: "bg-teal-100 text-teal-700" },
          CANCELLED: { label: "CANCELLED", color: "bg-red-100 text-red-700" },
          EXPIRED: { label: "EXPIRED", color: "bg-gray-300 text-gray-500" },
          REFUNDED: {
            label: "REFUNDED",
            color: "bg-purple-100 text-purple-700",
          },
        };

        const status =
          statusConfig[row.original.status] || statusConfig["CREATED"];

        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}
          >
            {status.label}
          </span>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) =>
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(row.original.totalAmount),
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const additionalActions =
          row.original.status === "PAID"
            ? [
                {
                  label: "Confirm",
                  className: "!text-green-700 !dark:text-green-400",
                  onClick: (order: Order) => {
                    setSelectedOrder(order);
                    setIsConfirmModalOpen(true);
                  },
                },
              ]
            : row.original.status === "SHIPPED"
            ? [
                {
                  label: "Delivered",
                  className: "!text-blue-700 !dark:text-blue-400",
                  onClick: (order: Order) => {
                    handleDelivered(order);
                  },
                },
              ]
            : [];

        return (
          <div className="flex gap-2 justify-left">
            <ActionDropdown<Order>
              item={row.original}
              onView={handleView}
              onEdit={handleEdit}
              additionalActions={additionalActions}
              onDelete={handleCancel}
              editLabel="Status"
              isEditable={false}
              deleteLabel="Cancel"
            />
          </div>
        );
      },
    },
  ];

  const totalOrders = totalItems;
  const createdOrders = orders.filter(
    (order) => order.status === "CREATED"
  ).length;
  const awaitingPaymentOrders = orders.filter(
    (order) => order.status === "AWAITING_PAYMENT"
  ).length;
  const paidOrders = orders.filter((order) => order.status === "PAID").length;
  const processingOrders = orders.filter(
    (order) => order.status === "PROCESSING"
  ).length;
  const shippedOrders = orders.filter(
    (order) => order.status === "SHIPPED"
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;
  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED"
  ).length;
  const expiredOrders = orders.filter(
    (order) => order.status === "EXPIRED"
  ).length;

  return (
    <>
      <DetailOrderModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      <ConfirmOrderModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onConfirmSuccess={handleConfirmSuccess}
      />

      <EditOrderStatusModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditOrder(null);
        }}
        orderId={editOrder?.id || ""}
        onSubmit={handleEditSubmit}
      />

      <HeaderTitlePage
        title="Orders"
        description="Manage your Order inventory here. You can add new products, edit existing ones, track stock levels, and organize products by categories. Keep your product catalog up to date to provide the best shopping experience for your customers."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <WidgetHeader
          variant="primary"
          title="Total Orders"
          value={String(totalOrders)}
          icon={<Package className="h-5 w-5 text-[#001363]" />}
        />
        <WidgetHeader
          title="Created Orders"
          value={String(createdOrders)}
          icon={<Clock className="h-5 w-5 text-white" />}
          variant="default"
        />
        <WidgetHeader
          title="Awaiting Payment"
          value={String(awaitingPaymentOrders)}
          icon={<Loader2 className="h-5 w-5 text-white" />}
          variant="default"
        />
        <WidgetHeader
          title="Paid Orders"
          value={String(paidOrders)}
          icon={<CheckCircle2 className="h-5 w-5 text-white" />}
          variant="default"
        />
        <WidgetHeader
          title="Processing Orders"
          value={String(processingOrders)}
          icon={<Loader2 className="h-5 w-5 text-white" />}
          variant="default"
        />
        <WidgetHeader
          title="Shipped Orders"
          value={String(shippedOrders)}
          icon={<Truck className="h-5 w-5 text-white" />}
          variant="default"
        />
        <WidgetHeader
          title="Delivered Orders"
          value={String(deliveredOrders)}
          icon={<Send className="h-5 w-5 text-white" />}
          variant="default"
        />
        <WidgetHeader
          title="Cancelled Orders"
          value={String(cancelledOrders)}
          icon={<XCircle className="h-5 w-5 text-white" />}
          variant="default"
        />
        <WidgetHeader
          title="Expired Orders"
          value={String(expiredOrders)}
          icon={<Ban className="h-5 w-5 text-white" />}
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
              onClick={() => alert("Filter products")}
            >
              <Filter className="size-4 text-[#151515] dark:text-white/80" />
            </Button>
            <Input
              type="search"
              placeholder="Search products..."
              className="w-64 h-10"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={paginatedData}
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
