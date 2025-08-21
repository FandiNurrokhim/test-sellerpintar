import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import type { Session } from "next-auth";
import type { NextApiRequest } from "next";
import type { NextRequest } from "next/server";
import type { IncomingMessage } from "http";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ServerRequest =
  | NextRequest
  | NextApiRequest
  | (IncomingMessage & { cookies: Partial<Record<string, string>> });

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
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
    body,
    requireAuth = false,
    req,
    accessToken,
    responseType = "json",
  } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  let token: string | undefined = accessToken;

  if (requireAuth && !token) {
    if (typeof window === "undefined" && req) {
      const serverToken = await getToken({ req });
      token = serverToken?.accessToken;
    } else {
      const session = (await getSession()) as Session | null;
      token = session?.user?.accessToken;
    }
    if (!token) throw new Error("Authorization token is required");
  }

  const headers: Record<string, string> = {};
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (requireAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
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
