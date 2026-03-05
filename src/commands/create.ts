import { createEndpoint, ApiError } from "../lib/api.js";
import { getApiUrl, getToken } from "../lib/config.js";
import { log } from "../ui/logger.js";

export async function createCommand() {
  try {
    const endpoint = await createEndpoint();
    const apiUrl = getApiUrl();
    const url = `${apiUrl}/w/${endpoint.slug}`;

    console.log();
    log.success("Endpoint created");
    console.log();
    console.log(`  URL: ${url}`);
    console.log();
    log.dim(`Use: hooksense listen ${endpoint.slug} --forward http://localhost:3000/webhook`);
    console.log();
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 429) {
        log.error("Rate limit reached");
        if (!getToken()) {
          console.log();
          log.info("Log in to remove rate limits:");
          log.info("  hooksense login");
        } else {
          log.info("Wait a few minutes and try again.");
        }
      } else if (err.status === 403 && err.upgrade) {
        log.error("Endpoint limit reached on your current plan");
        console.log();
        log.info("Upgrade at https://hooksense.com/pricing");
      } else {
        log.error(err.message);
      }
    } else {
      log.error(err instanceof Error ? err.message : "Failed to create endpoint");
    }
    process.exit(1);
  }
}
