import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import type { Session } from "next-auth";
import type { NextApiRequest } from "next";
import type { NextRequest } from "next/server";
import type { IncomingMessage } from "http";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ExtendedSession extends Session {
  user: Session["user"] & {
    accessToken?: string;
  };
  organizationId?: string;
  branchId?: string;
}

type ServerRequest =
  | NextRequest
  | NextApiRequest
  | (IncomingMessage & { cookies: Partial<Record<string, string>> });

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  requireAuth?: boolean;
  req?: ServerRequest;
  accessToken?: string;
  responseType?: "json" | "blob";
};

export async function apiCall<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    method = "GET",
    headers = {},
    body,
    requireAuth = false,
    req,
    accessToken,
    responseType = "json",
  } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  let session: ExtendedSession | null = null;

  const hasOrgHeader =
    headers["x-organization-id"] !== undefined ||
    headers["X-Organization-Id"] !== undefined;
  const hasBranchHeader =
    headers["x-branch-id"] !== undefined ||
    headers["X-Branch-Id"] !== undefined;

  const hasAuthHeader =
    headers["Authorization"] !== undefined ||
    headers["authorization"] !== undefined;

  if (
    (!hasOrgHeader || !hasBranchHeader || (!hasAuthHeader && requireAuth)) &&
    typeof window !== "undefined"
  ) {
    session = (await getSession()) as ExtendedSession | null;
  }

  let branchId: string | undefined = undefined;
  if (!hasBranchHeader && typeof window !== "undefined") {
    branchId = sessionStorage.getItem("branchId") || session?.branchId;
  }

  let defaultHeaders: Record<string, string> = {};
  if (!(body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (!hasOrgHeader && session?.organizationId)
    defaultHeaders["x-organization-id"] = session.organizationId;
  if (!hasBranchHeader && branchId) defaultHeaders["x-branch-id"] = branchId;

  if (requireAuth && !hasAuthHeader) {
    let token: string | undefined = accessToken;
    if (!token) {
      if (typeof window === "undefined" && req) {
        const serverToken = await getToken({ req });
        token = serverToken?.accessToken;
      } else {
        token = session?.user?.accessToken;
      }
    }
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    } else {
      throw new Error("Authorization token is required");
    }
  }

  defaultHeaders = { ...defaultHeaders, ...headers };

  const fetchOptions: RequestInit = {
    method,
    headers: defaultHeaders,
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  };

  if (body instanceof FormData && fetchOptions.headers) {
    const headersRecord = fetchOptions.headers as Record<string, string>;
    delete headersRecord["Content-Type"];
  }

  const response = await fetch(url, fetchOptions);

  let result;
  if (responseType === "blob") {
    result = await response.blob();
  } else {
    result = await response.json();
  }

  if (!response.ok) {
    throw new Error(result.message || `HTTP error! status: ${response.status}`);
  }

  return result;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiCall("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  register: (userData: Record<string, unknown>) =>
    apiCall("/auth/register", {
      method: "POST",
      body: userData,
    }),
};

export const categoryPatientApi = {
  getAll: (requireAuth = false, options: ApiOptions = {}) =>
    apiCall("/case-categories", { requireAuth, ...options }),
};

export const patientApi = {
  getAll: (requireAuth = true, options: ApiOptions = {}) =>
    apiCall("/study-cases", { requireAuth, ...options }),
  getByUuid: (uuid: string, requireAuth = true, options: ApiOptions = {}) =>
    apiCall(`/study-cases/${uuid}`, { requireAuth, ...options }),
  create: (
    studyCaseData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall("/study-cases", {
      method: "POST",
      body: studyCaseData,
      requireAuth,
      ...options,
    }),
  update: (
    uuid: string,
    studyCaseData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall(`/study-cases/${uuid}`, {
      method: "PUT",
      body: studyCaseData,
      requireAuth,
      ...options,
    }),
  delete: (uuid: string, requireAuth = true, options: ApiOptions = {}) =>
    apiCall(`/study-cases/${uuid}`, {
      method: "DELETE",
      requireAuth,
      ...options,
    }),
  generateAvatar: (
    scenario: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall(`/study-cases/generate-avatar`, {
      method: "POST",
      body: scenario,
      requireAuth,
      ...options,
    }),
};

// history session
// export const historySessionApi = {
//   getAll: (requireAuth = true, options: ApiOptions = {}) =>
//     apiCall("/session/history", { requireAuth, ...options }),
//   getSessionByUuid: (
//     uuid: string,
//     requireAuth = true,
//     options: ApiOptions = {}
//   ) => apiCall(`/session/${uuid}`, { requireAuth, ...options }),
//   getSessionTranscriptByUuid: (
//     uuid: string,
//     requireAuth = true,
//     options: ApiOptions = {}
//   ) => apiCall(`/session/${uuid}/transcripts`, { requireAuth, ...options }),
//   startSession: (
//     study_case_id: string,
//     requireAuth = true,
//     options: ApiOptions = {}
//   ) =>
//     apiCall("/session/start", {
//       method: "POST",
//       body: { study_case_id },
//       requireAuth,
//       ...options,
//     }),
// };
