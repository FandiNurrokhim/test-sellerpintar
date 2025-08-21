import { apiCall, ApiOptions } from "@/utils/api";

function getDefaultHeaders(): Record<string, string> {
  const org = JSON.parse(sessionStorage.getItem("organization") || "{}");
  const branch = JSON.parse(sessionStorage.getItem("branch") || "{}");

  return {
    "x-organization-id": org.id || "",
    "x-branch-id": branch.id || "",
  };
}

export const assistantApi = {
  getById: (
    id: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall(`/assistant/${id}`, {
      requireAuth,
      ...options,
      headers: {
        ...getDefaultHeaders(),
        ...(options.headers || {}),
      },
    }),

  create: (
    assistantData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall("/assistant", {
      method: "POST",
      body: assistantData,
      requireAuth,
      ...options,
      headers: {
        ...getDefaultHeaders(),
        ...(options.headers || {}),
      },
    }),

  update: (
    id: string,
    assistantData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall(`/assistant/${id}`, {
      method: "PUT",
      body: assistantData,
      requireAuth,
      ...options,
      headers: {
        ...getDefaultHeaders(),
        ...(options.headers || {}),
      },
    }),
};
