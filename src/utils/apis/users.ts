import { apiCall, ApiOptions } from "@/utils/api";

export const userApi = {
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
    const url = queryString ? `/auth/users?${queryString}` : "/auth/users";

    return apiCall(url, {
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    });
  },

  update: (
    id: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
      roles?: string[];
    },
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) => {
    return apiCall(`/auth/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      requireAuth,
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...headers,
      },
    });
  },

  getById: (
    id: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) => {
    return apiCall(`/auth/user/${id}`, {
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    });
  },

  delete: (
    id: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) => {
    return apiCall(`/auth/user/${id}`, {
      method: "DELETE",
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    });
  },
};
