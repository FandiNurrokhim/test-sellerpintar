import { apiCall, ApiOptions } from "@/utils/api";

interface ApiResponse<T> {
  data: T;
}

interface ApiRoleData {
  id: string;
  organizationId: string;
  branchId?: string;
  scope: string;
  role: string; // Nama peran dari API
  users: string[];
  deletable: boolean;
  permission: string[]; // Daftar izin dari API
  createdAt: string;
  updatedAt: string;
}

export const rolesApi = {
  getAll: (
    organizationId: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) => {
    return apiCall<ApiResponse<ApiRoleData[]>>(
      `/organizations/${organizationId}/roles`,
      {
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      }
    );
  },

  create: (
    organizationId: string,
    data: {
      branchId?: string;
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
    return apiCall<ApiResponse<ApiRoleData>>(
      `/organizations/${organizationId}/roles`,
      {
        method: "POST",
        body: {
          organizationId,
          ...data,
        },
        requireAuth,
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          ...headers,
        },
      }
    );
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
    return apiCall<ApiResponse<ApiRoleData>>(`/organizations/roles/${roleId}`, {
      method: "PUT",
      body: data,
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
    return apiCall<ApiResponse<ApiRoleData>>(`/organizations/roles/${roleId}`, {
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
    return apiCall<ApiResponse<{ message: string }>>(
      `/organizations/roles/${roleId}`,
      {
        method: "DELETE",
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      }
    );
  },
};
