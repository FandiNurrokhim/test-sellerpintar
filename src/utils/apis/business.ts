import { apiCall, ApiOptions } from "@/utils/api";

// Types for API responses
interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

interface Organization {
  id: string;
  name: string;
  userId: string;
  users: string[];
  organizationCode: string;
  maxBranches: number;
  createdAt: string;
  updatedAt: string;
}

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

export const businessApi = {
  getUserProfile: (requireAuth = true, options: ApiOptions = {}) =>
    apiCall<ApiResponse<UserProfile>>("/auth/profile", {
      requireAuth,
      ...options,
    }),

  getOrganizations: (requireAuth = true, options: ApiOptions = {}) =>
    apiCall<ApiResponse<Organization[]>>("/organizations", {
      requireAuth,
      ...options,
    }),

  getOrganizationById: (
    organizationId: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<Organization>>(`/organizations/${organizationId}`, {
      requireAuth,
      ...options,
    }),

  createOrganization: (
    organizationData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<Organization>>("/organizations", {
      method: "POST",
      body: organizationData,
      requireAuth,
      ...options,
    }),

  updateOrganization: (
    organizationId: string,
    organizationData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<Organization>>(`/organizations/${organizationId}`, {
      method: "PUT",
      body: organizationData,
      requireAuth,
      ...options,
    }),

  deleteOrganization: (
    organizationId: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<{ message: string }>>(
      `/organizations/${organizationId}`,
      {
        method: "DELETE",
        requireAuth,
        ...options,
      }
    ),

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

  // Additional business-related endpoints
  getBusinessSettings: (requireAuth = true, options: ApiOptions = {}) =>
    apiCall<ApiResponse<Record<string, unknown>>>("/business/settings", {
      requireAuth,
      ...options,
    }),

  updateBusinessSettings: (
    settingsData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<Record<string, unknown>>>("/business/settings", {
      method: "PUT",
      body: settingsData,
      requireAuth,
      ...options,
    }),
};
