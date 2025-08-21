import { apiCall, ApiOptions } from "@/utils/api";
import { ProductPayload } from "@/schemas/initiateSetup/product";

export const productApi = {
  // ==================================
  // Categories
  // ==================================
  getCategories: (
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) =>
    apiCall("/products/categories", {
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    }),

  createCategory: (
    categoryData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) =>
    apiCall("/products/categories", {
      method: "POST",
      body: categoryData,
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    }),

  getCategoryById: (
    id: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) =>
    apiCall(`/products/categories/${id}`, {
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    }),

  updateCategory: (
    id: string,
    categoryData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) =>
    apiCall(`/products/categories/${id}`, {
      method: "PUT",
      body: categoryData,
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    }),

  deleteCategory: (
    id: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) =>
    apiCall(`/products/categories/${id}`, {
      method: "DELETE",
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    }),

  // ==================================
  // Product
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
    const url = queryString ? `/products?${queryString}` : "/products";

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
    apiCall(`/products/${id}`, {
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    }),

  create: (
    productData: ProductPayload,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) =>
    apiCall("/products", {
      method: "POST",
      body: productData,
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    }),

  update: (
    id: string,
    productData: ProductPayload,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) => {
    return apiCall(`/products/${id}`, {
      method: "PUT",
      body: productData,
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
  ) =>
    apiCall(`/products/${id}`, {
      method: "DELETE",
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    }),

  // ==================================
  // Product bulk upload
  // ==================================
  getTemplate: (options: ApiOptions = {}) =>
    apiCall("/products/excel/template", {
      ...options,
      responseType: "blob",
    }),

  // utils/apis/product.ts
  uploadProducts: async (
    data: FormData,
    config?: { headers?: Record<string, string> }
  ) => {
    return await apiCall("/products/bulk-upload", {
      method: "POST",
      body: data,
      headers: config?.headers,
    });
  },
};
