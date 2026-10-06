import WebSocket from "ws";
import { getApiUrl, getToken } from "./config.js";
import { log } from "../ui/logger.js";

interface WsOptions {
  slug: string;
  onMessage: (data: unknown) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onFatal?: (message: string) => void;
}

export function connectWebSocket(options: WsOptions): { close: () => void } {
  const { slug, onMessage, onConnect, onDisconnect } = options;
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;
  let backoff = 1000;

  function connect() {
    if (closed) return;

    const apiUrl = getApiUrl();
    const wsUrl = apiUrl.replace(/^http/, "ws") + `/ws?slug=${encodeURIComponent(slug)}`;

    const token = getToken();
    ws = new WebSocket(wsUrl, {
      headers: token ? { Cookie: `token=${token}` } : {},
      handshakeTimeout: 15_000,
    });

    ws.on("open", () => {
      backoff = 1000;
      onConnect?.();
    });

    ws.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        onMessage(data);
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("close", (code, reason) => {
      if (code === 1008) {
        closed = true;
        const message = `Subscription rejected: ${reason.toString() || "not authorized"}. Run hooksense login and check the endpoint.`;
        if (options.onFatal) options.onFatal(message);
        else log.error(message);
        return;
      }
      onDisconnect?.();
      scheduleReconnect();
    });

    ws.on("error", () => {
      // error will be followed by close
    });
  }

  function scheduleReconnect() {
    if (closed) return;
    reconnectTimer = setTimeout(() => {
      log.dim(`Reconnecting...`);
      connect();
      backoff = Math.min(backoff * 2, 30000);
    }, backoff);
  }

  connect();

  return {
    close() {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    },
  };
}
