import { createEndpoint, getEndpoint, type WebhookRequest } from "../lib/api.js";
import { connectWebSocket } from "../lib/ws.js";
import { forwardRequest } from "../lib/forward.js";
import { getApiUrl } from "../lib/config.js";
import { log } from "../ui/logger.js";

interface ListenOptions {
  forward?: string;
  api?: string;
}

export async function listenCommand(slug: string | undefined, options: ListenOptions) {
  const forwardUrl = options.forward;

  try {
    // Resolve or create endpoint
    let endpointSlug: string;

    if (slug) {
      // Verify endpoint exists
      const endpoint = await getEndpoint(slug);
      endpointSlug = endpoint.slug;
    } else {
      // Create a new endpoint
      log.info("Creating new endpoint...");
      const endpoint = await createEndpoint();
      endpointSlug = endpoint.slug;
    }

    const apiUrl = getApiUrl();
    const endpointUrl = `${apiUrl}/w/${endpointSlug}`;

    log.banner(endpointUrl, forwardUrl);

    // Connect WebSocket
    const ws = connectWebSocket({
      slug: endpointSlug,
      onMessage: async (data) => {
        const msg = data as { type: string; request: WebhookRequest };
        if (msg.type !== "new_request") return;

        const req = msg.request;
        log.request(req.method, req.contentType, req.sizeBytes);

        if (forwardUrl) {
          const result = await forwardRequest(req, forwardUrl);
          if (result.error) {
            log.forwardError(result.error);
          } else {
            log.forward(result.status, result.statusText, result.durationMs);
          }
        } else {
          // Just log that we received it
          console.log();
        }
      },
      onDisconnect: () => {
        log.disconnected();
      },
    });

    // Handle Ctrl+C
    process.on("SIGINT", () => {
      console.log();
      log.dim("Shutting down...");
      ws.close();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      ws.close();
      process.exit(0);
    });
  } catch (err) {
    log.error(err instanceof Error ? err.message : "Failed to start listener");
    process.exit(1);
  }
}
