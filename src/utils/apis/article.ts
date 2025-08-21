import { apiCall, ApiOptions } from "@/utils/api";

export const articleApi = {
  // ==================================
  // Articles
  // ==================================
  getArticles: (
    requireAuth = true,
    options: ApiOptions = {},
  ) =>
    apiCall("/articles", {
      requireAuth,
      ...options,
    }),

  createArticle: (
    articleData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {},
  ) =>
    apiCall("/articles", {
      method: "POST",
      body: articleData,
      requireAuth,
      ...options,
    }),

  getArticleById: (
    id: string,
    requireAuth = true,
    options: ApiOptions = {},
  ) =>
    apiCall(`/articles/${id}`, {
      requireAuth,
      ...options,
    }),

  updateArticle: (
    id: string,
    articleData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {},
  ) =>
    apiCall(`/articles/${id}`, {
      method: "PUT",
      body: articleData,
      requireAuth,
      ...options,
    }),

  deleteArticle: (
    id: string,
    requireAuth = true,
    options: ApiOptions = {},
  ) =>
    apiCall(`/articles/${id}`, {
      method: "DELETE",
      requireAuth,
      ...options,
    }),
};
