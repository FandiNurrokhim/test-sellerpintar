import React from "react";
import { Button } from "@/components/atoms/Forms/Button";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import { Order } from "@/schemas/order/order";

interface DetailOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const DetailOrderModal: React.FC<DetailOrderModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  return (
    <ModalSide isOpen={isOpen} onClose={onClose}>
      <div className="border-b border-gray-200 mb-4">
        <h2 className="text-lg font-bold !font-sentient dark:text-white/80">
          Order Details
        </h2>
        <p className="text-sm text-gray-500 dark:text-white/60 mb-4">
          View detailed information about this order.
        </p>
      </div>

      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white/80">
            Order Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <span className="font-medium text-gray-700 dark:text-white/60">
                Order Number
              </span>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                {order?.orderNumber || "-"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-white/60">
                Customer Name
              </span>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                {order?.customerDetails?.name || "-"}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-700 dark:text-white/60">
                Status
              </span>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md capitalize">
                {order?.status || "CREATED"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-white/60">
                Total Amount
              </span>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                {order?.totalAmount ? formatPrice(order.totalAmount) : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white/80">
            Order Items
          </h3>
          {order?.items && order.items.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <li
                  key={item.productVariantId || idx}
                  className="py-4 flex gap-4 items-center"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white/80">
                      {item.metadata?.productName || "-"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-white/60">
                      Variant: {item.metadata?.variantName || "-"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 dark:text-white/60">
                      Price: {item.price ? formatPrice(item.price) : "-"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 dark:text-white/60">
                      Quantity: {item.quantity ?? "-"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 dark:text-white/60">
                      Subtotal:{" "}
                      {item.subtotal ? formatPrice(item.subtotal) : "-"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 dark:text-white/80 text-sm">
              No items in this order.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
        <Button variant="ghost" type="button" onClick={onClose}>
          Close
        </Button>
      </div>
    </ModalSide>
  );
};
