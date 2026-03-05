import { createEndpoint } from "../lib/api.js";
import { getApiUrl } from "../lib/config.js";
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
    log.error(err instanceof Error ? err.message : "Failed to create endpoint");
    process.exit(1);
  }
}
