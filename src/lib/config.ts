import Conf from "conf";

interface HookSenseConfig {
  apiUrl: string;
  token: string | null;
  lastSlug: string | null;
}

const config = new Conf<HookSenseConfig>({
  projectName: "hooksense",
  defaults: {
    apiUrl: "https://hooksense.com",
    token: null,
    lastSlug: null,
  },
});

export function getApiUrl(): string {
  return process.env.HOOKSENSE_API || config.get("apiUrl");
}

export function setApiUrl(url: string): void {
  config.set("apiUrl", url);
}

export function getToken(): string | null {
  return config.get("token");
}

export function setToken(token: string): void {
  config.set("token", token);
}

export function clearToken(): void {
  config.set("token", null);
}

export function getLastSlug(): string | null {
  return config.get("lastSlug");
}

export function setLastSlug(slug: string): void {
  config.set("lastSlug", slug);
}

export { config };
