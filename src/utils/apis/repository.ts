// utils/apis/repository.ts
import { apiCall, ApiOptions } from "@/utils/api";

export const repository = {
  uploadSingleImageFile: (
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ) =>
    apiCall("/repository/upload/single", {
      requireAuth,
      ...options,
      headers: { ...(options.headers || {}), ...headers },
    }),
};
