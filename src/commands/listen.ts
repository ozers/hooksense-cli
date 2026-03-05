import { createEndpoint, getEndpoint, type WebhookRequest } from "../lib/api.js";
import { connectWebSocket } from "../lib/ws.js";
import { forwardRequest } from "../lib/forward.js";
import { getApiUrl, getLastSlug, setLastSlug } from "../lib/config.js";
import { log } from "../ui/logger.js";

interface ListenOptions {
  forward?: string;
  port?: string;
  api?: string;
  filter?: string;
  verbose?: boolean;
}

export async function listenCommand(slug: string | undefined, options: ListenOptions) {
  // Resolve forward URL from --forward or --port
  let forwardUrl = options.forward;
  if (!forwardUrl && options.port) {
    forwardUrl = `http://localhost:${options.port}`;
  }

  // Validate filter
  const filter = options.filter?.toUpperCase() || null;
  const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
  if (filter && !validMethods.includes(filter)) {
    log.error(`Invalid method filter: ${filter}`);
    process.exit(1);
  }

  // Stats tracking
  let totalRequests = 0;
  let forwarded = 0;
  let failed = 0;
  let skipped = 0;
  const startTime = Date.now();

  try {
    // Resolve or create endpoint
    let endpointSlug: string;

    if (slug) {
      // Explicit slug provided
      const endpoint = await getEndpoint(slug);
      endpointSlug = endpoint.slug;
    } else {
      // Try reusing last endpoint first
      const lastSlug = getLastSlug();
      if (lastSlug) {
        try {
          const endpoint = await getEndpoint(lastSlug);
          endpointSlug = endpoint.slug;
          log.info(`Reusing endpoint ${endpointSlug}`);
        } catch {
          // Last endpoint expired or gone, create new
          log.info("Previous endpoint expired, creating new one...");
          const endpoint = await createEndpoint();
          endpointSlug = endpoint.slug;
        }
      } else {
        log.info("Creating new endpoint...");
        const endpoint = await createEndpoint();
        endpointSlug = endpoint.slug;
      }
    }

    // Remember this slug for next time
    setLastSlug(endpointSlug);

    const apiUrl = getApiUrl();
    const endpointUrl = `${apiUrl}/w/${endpointSlug}`;

    log.banner(endpointUrl, forwardUrl, filter);

    // Connect WebSocket
    const ws = connectWebSocket({
      slug: endpointSlug,
      onMessage: async (data) => {
        const msg = data as { type: string; request: WebhookRequest };
        if (msg.type !== "new_request") return;

        const req = msg.request;
        totalRequests++;

        // Apply method filter
        if (filter && req.method !== filter) {
          skipped++;
          return;
        }

        log.request(req.method, req.contentType, req.sizeBytes, req.sourceIp);

        if (options.verbose && req.body) {
          console.log();
          log.requestBody(req.body, req.contentType);
        }

        if (forwardUrl) {
          const result = await forwardRequest(req, forwardUrl);
          if (result.error) {
            failed++;
            log.forwardError(result.error);
          } else {
            forwarded++;
            log.forward(result.status, result.statusText, result.durationMs);

            if (options.verbose && result.responseBody) {
              log.responseBody(result.responseBody);
            }
          }
        } else {
          console.log();
        }
      },
      onDisconnect: () => {
        log.disconnected();
      },
    });

    function shutdown() {
      console.log();
      const duration = Math.round((Date.now() - startTime) / 1000);
      log.summary(totalRequests, forwarded, failed, skipped, duration);
      ws.close();
      process.exit(0);
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    log.error(err instanceof Error ? err.message : "Failed to start listener");
    process.exit(1);
  }
}
