export type OrderItem = {
  productVariantId: string;
  quantity: number;
  price: number;
  subtotal: number;
  metadata: {
    productName: string;
    variantName: string;
  };
};

export type ShippingDetails = {
  selectedCourier: string;
  selectedCourierServiceCode: string;
  cost: number;
  destinationLatitude: number;
  destinationLongitude: number;
};

export type OrderStatus =
  | "CREATED"
  | "AWAITING_PAYMENT"
  | "UNPAID"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";

export type Order = {
  id: string;
  orderNumber: string;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  organizationId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
  shippingDetails?: ShippingDetails;
};

export type OrdersResponse = {
  status: string;
  code: number;
  message: string;
  data: {
    orders: Order[];
    total: number;
  };
};
