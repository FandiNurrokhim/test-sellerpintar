import { apiCall, ApiOptions } from "@/utils/api";

type Branch = {
  id: string;
  name: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  paymentInformation?: {
    accountName: string;
    accountCode: string;
    accountNumber: string;
  };
};

interface ApiResponse<T> {
  data: T;
}

export const branchesApi = {
  // Branches
  getBranches: (
    organizationId: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<Branch[]>>(
      `/organizations/${organizationId}/branches`,
      {
        requireAuth,
        ...options,
      }
    ),

  getBranchById: (
    branchId: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<Branch>>(`/organizations/branches/${branchId}`, {
      requireAuth,
      ...options,
    }),

  createBranch: (
    organizationId: string,
    branchData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<Branch>>(`/organizations/${organizationId}/branches`, {
      method: "POST",
      body: branchData,
      requireAuth,
      ...options,
    }),

  updateBranch: (
    branchId: string,
    branchData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<Branch>>(`/organizations/branches/${branchId}`, {
      method: "PUT",
      body: branchData,
      requireAuth,
      ...options,
    }),

  deleteBranch: (
    branchId: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<{ message: string }>>(
      `/organizations/branches/${branchId}`,
      {
        method: "DELETE",
        requireAuth,
        ...options,
      }
    ),
};
