import { apiCall, ApiOptions } from "@/utils/api";

interface ShippingPayload {
  courier: string;
  courierServiceCode: string;
}

export const orderApi = {
  // ==================================
  // order
  // ==================================
  getAll: (
    params: { page?: number; perPage?: number } = {},
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.perPage)
      searchParams.append("perPage", params.perPage.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `/orders?${queryString}` : "/orders";

    return apiCall(url, {
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    });
  },

  getById: (
    id: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) =>
    apiCall(`/orders/${id}`, {
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    }),

  updateStatus: (
    id: string,
    orderData: { status: string },
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall(`/orders/${id}/status`, {
      method: "PUT",
      body: orderData,
      requireAuth,
      ...options,
    }),

  cancel: (id: string, requireAuth = true, options: ApiOptions = {}) =>
    apiCall(`/orders/${id}/cancel`, {
      method: "POST",
      requireAuth,
      ...options,
    }),

  handleShipping: (
    id: string,
    options: ApiOptions = {},
    requireAuth = true,
    shippingData: ShippingPayload
  ) =>
    apiCall(`/orders/${id}/shipping`, {
      method: "POST",
      body: shippingData,
      requireAuth,
      ...options,
    }),
};
