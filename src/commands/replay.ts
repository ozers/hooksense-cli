import { replayRequest, ApiError } from "../lib/api.js";
import { getToken } from "../lib/config.js";
import { log } from "../ui/logger.js";

interface ReplayOptions {
  forward?: string;
  port?: string;
}

export async function replayCommand(id: string, options: ReplayOptions) {
  let targetUrl = options.forward;
  if (!targetUrl && options.port) {
    targetUrl = `http://localhost:${options.port}`;
  }
  if (!targetUrl) {
    log.error("Specify a target with -p <port> or -f <url>");
    process.exit(1);
  }

  try {
    log.info(`Replaying request ${id} → ${targetUrl}`);
    const result = await replayRequest(id, targetUrl);
    log.forward(result.status, result.statusText, result.durationMs);
    if (result.responseBody) {
      log.responseBody(result.responseBody);
    }
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        log.error("Authentication required");
        log.info("Run `hooksense login` first.");
      } else if (err.status === 404) {
        log.error(`Request ${id} not found`);
      } else if ((err.status === 402 || err.status === 403) && err.upgrade) {
        log.error("Replay limit reached on your current plan");
        log.info("Upgrade at https://hooksense.com/pricing");
      } else if (err.status === 429) {
        log.error("Rate limit reached");
        if (!getToken()) {
          log.info("Run `hooksense login` to remove rate limits.");
        }
      } else {
        log.error(err.message);
      }
    } else {
      log.error(err instanceof Error ? err.message : "Replay failed");
    }
    process.exit(1);
  }
}
