import React from "react";
import { Button } from "@/components/atoms/Forms/Button";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import { Order } from "@/schemas/order/order";
import { LocationPickerMap } from "@/components/molecules/Map/LocationPickerMap";
import { useSession } from "next-auth/react";
import { orderApi } from "@/utils/apis/orders";
import Swal from "sweetalert2";
import { useToast } from "@/components/atoms/ToastProvider";

interface ConfirmOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirmSuccess?: () => void;
}
const DEFAULT_LAT = -7.2575;
const DEFAULT_LNG = 110.4041;

export const ConfirmOrderModal: React.FC<ConfirmOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmSuccess,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };
  const latitude = order?.shippingDetails?.destinationLatitude;
  const longitude = order?.shippingDetails?.destinationLongitude;
  const [isLoading, setIsLoading] = React.useState(false);
  const { showToast } = useToast();

  const { data: session } = useSession();
  const token = session?.user.accessToken;
  const organizationId = session?.organizationId;
  const branchId = sessionStorage.getItem("branchId") || session?.branchId;

  const headers: Record<string, string> = {};
  if (organizationId) headers["x-organization-id"] = organizationId;
  if (branchId) headers["x-branch-id"] = branchId;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const handleShipping = async () => {
    if (!order) return;
    const result = await Swal.fire({
      title: "Confirm Order?",
      text: "Are you sure you want to confirm this order?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, confirm",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      const shippingPayload = {
        courier: order.shippingDetails?.selectedCourier || "",
        courierServiceCode:
          order.shippingDetails?.selectedCourierServiceCode || "",
      };
      await orderApi.handleShipping(
        order.id,
        { headers },
        true,
        shippingPayload
      );
      showToast("Order confirmed successfully", "success");
      if (onConfirmSuccess) {
        onConfirmSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Failed to confirm shipping:", error);
      showToast(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message ??
              "Failed to confirm order status"
          : "Failed to confirm order status",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalSide isOpen={isOpen} onClose={onClose}>
      <div className="border-b border-gray-200 mb-4">
        <h2 className="text-lg font-bold !font-sentient dark:text-white/80">
          Confirmation Details
        </h2>
        <p className="text-sm text-gray-500 dark:text-white/60 mb-4">
          View confirm information about this order.
        </p>
      </div>

      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white/80">
            Shipping Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <span className="font-medium text-gray-700 dark:text-white/60">
                Shipping Courier
              </span>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md uppercase">
                {order?.shippingDetails?.selectedCourier || "-"}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-700 dark:text-white/60">
                Location
              </span>
              <LocationPickerMap
                lat={latitude || DEFAULT_LAT}
                lng={longitude || DEFAULT_LNG}
                readOnly={true}
              />
            </div>
            <div className="grid grid-cols-2">
              <div>
                <span className="font-medium text-gray-700 dark:text-white/60">
                  Latitude
                </span>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                  {latitude || "-"}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-white/60">
                  Longitude
                </span>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                  {longitude || "-"}
                </p>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-white/60">
                Total Payment
              </span>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                {order?.shippingDetails?.cost
                  ? formatPrice(order.shippingDetails?.cost)
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
        <Button variant="ghost" type="button" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="default"
          type="button"
          disabled={isLoading}
          onClick={handleShipping}
        >
          {isLoading ? "Confirming..." : "Confirm Order"}
        </Button>
      </div>
    </ModalSide>
  );
};
