import { listEndpoints } from "../lib/api.js";
import { getApiUrl } from "../lib/config.js";
import { log } from "../ui/logger.js";
import pc from "picocolors";

export async function listCommand() {
  try {
    const endpoints = await listEndpoints();

    if (endpoints.length === 0) {
      log.info("No endpoints found. Create one with: hooksense create");
      return;
    }

    console.log();
    console.log(`  ${pc.bold("Your endpoints")} ${pc.dim(`(${endpoints.length})`)}`);
    console.log();

    const apiUrl = getApiUrl();

    for (const ep of endpoints) {
      const created = new Date(ep.createdAt).toLocaleDateString();
      const expires = ep.expiresAt
        ? new Date(ep.expiresAt).toLocaleDateString()
        : pc.dim("never");

      console.log(`  ${pc.cyan(ep.slug)}  ${pc.dim(apiUrl + "/w/" + ep.slug)}`);
      console.log(`  ${pc.dim("Created:")} ${created}  ${pc.dim("Expires:")} ${expires}`);
      console.log();
    }
  } catch (err) {
    log.error(err instanceof Error ? err.message : "Failed to list endpoints");
    process.exit(1);
  }
}
