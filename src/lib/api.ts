import { getApiUrl, getToken } from "./config.js";

interface Endpoint {
  id: string;
  slug: string;
  userId: string | null;
  createdAt: string;
  expiresAt: string | null;
}

interface WebhookRequest {
  id: string;
  method: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body: string | null;
  contentType: string | null;
  sourceIp: string | null;
  sizeBytes: number;
  receivedAt: string;
}

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const apiUrl = getApiUrl();
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Cookie"] = `token=${token}`;
  }

  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
  });

  return res;
}

export async function createEndpoint(): Promise<Endpoint> {
  const res = await apiFetch("/api/endpoints", { method: "POST" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create endpoint");
  }
  return res.json();
}

export async function getEndpoint(slug: string): Promise<Endpoint> {
  const res = await apiFetch(`/api/endpoints/${slug}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Endpoint not found");
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<{ token: string }> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Login failed");
  }

  // Extract token from Set-Cookie header
  const setCookie = res.headers.get("set-cookie") || "";
  const tokenMatch = setCookie.match(/token=([^;]+)/);
  const token = tokenMatch?.[1] || null;

  if (!token) {
    throw new Error("No auth token received");
  }

  return { token };
}

export async function listEndpoints(): Promise<Endpoint[]> {
  const res = await apiFetch("/api/endpoints");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to list endpoints");
  }
  return res.json();
}

export type { Endpoint, WebhookRequest };
