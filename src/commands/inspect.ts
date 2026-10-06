import { getEndpoint } from "../lib/api.js";
import { getApiUrl } from "../lib/config.js";
import { log } from "../ui/logger.js";
import { openBrowser } from "../lib/browser.js";

export async function inspectCommand(slug: string) {
  try {
    // Verify endpoint exists
    await getEndpoint(slug);

    const apiUrl = getApiUrl();
    const url = `${apiUrl}/endpoint/${encodeURIComponent(slug)}`;

    try {
      await openBrowser(url);
      log.success(`Opened ${url}`);
    } catch {
      log.info(`Open in browser: ${url}`);
    }
  } catch (err) {
    log.error(err instanceof Error ? err.message : "Failed to open endpoint");
    process.exit(1);
  }
}
