import type { WebhookRequest } from "./api.js";

export interface ForwardResult {
  status: number;
  statusText: string;
  durationMs: number;
  error?: string;
  responseBody?: string;
}

export async function forwardRequest(
  request: WebhookRequest,
  targetUrl: string
): Promise<ForwardResult> {
  const start = Date.now();

  try {
    // Build headers, filtering out hop-by-hop and infrastructure headers
    const skipHeaders = new Set([
      "host",
      "connection",
      "keep-alive",
      "transfer-encoding",
      "te",
      "trailer",
      "upgrade",
      "proxy-authorization",
      "proxy-connection",
      "cf-connecting-ip",
      "cf-ray",
      "cf-ipcountry",
      "x-forwarded-for",
      "x-forwarded-proto",
      "x-forwarded-host",
      "x-real-ip",
      "x-vercel-id",
      "fly-request-id",
    ]);

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(request.headers)) {
      if (!skipHeaders.has(key.toLowerCase())) {
        headers[key] = value;
      }
    }

    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
    });

    let responseBody: string | undefined;
    try {
      responseBody = await res.text();
    } catch {}

    return {
      status: res.status,
      statusText: res.statusText,
      durationMs: Date.now() - start,
      responseBody,
    };
  } catch (err) {
    return {
      status: 0,
      statusText: "Error",
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
