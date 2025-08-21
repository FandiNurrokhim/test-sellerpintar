import { apiCall, ApiOptions } from "@/utils/api";

export const branchRolesApi = {
  getAll: (
    branchId: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) => {
    return apiCall(`/organizations/branches/${branchId}/roles`, {
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    });
  },

  create: (
    branchId: string,
    data: {
      organizationId: string;
      scope: string;
      role: string;
      users: string[];
      deletable: boolean;
      permission: string[];
    },
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) => {
    return apiCall(`/organizations/branches/${branchId}/roles`, {
      method: "POST",
      body: JSON.stringify({
        branchId,
        ...data,
      }),
      requireAuth,
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...headers,
      },
    });
  },

  update: (
    roleId: string,
    data: {
      role?: string;
      users?: string[];
      deletable?: boolean;
      permission?: string[];
    },
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) => {
    return apiCall(`/organizations/roles/${roleId}`, {
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
    roleId: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) => {
    return apiCall(`/organizations/roles/${roleId}`, {
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    });
  },

  delete: (
    roleId: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) => {
    return apiCall(`/organizations/roles/${roleId}`, {
      method: "DELETE",
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    });
  },
};
