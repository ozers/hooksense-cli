import { getEndpoint } from "../lib/api.js";
import { getApiUrl } from "../lib/config.js";
import { log } from "../ui/logger.js";
import { exec } from "node:child_process";
import { platform } from "node:os";

export async function inspectCommand(slug: string) {
  try {
    // Verify endpoint exists
    await getEndpoint(slug);

    const apiUrl = getApiUrl();
    const url = `${apiUrl}/endpoint/${slug}`;

    // Open in default browser
    const cmd = platform() === "darwin"
      ? `open "${url}"`
      : platform() === "win32"
        ? `start "${url}"`
        : `xdg-open "${url}"`;

    exec(cmd, (err) => {
      if (err) {
        log.info(`Open in browser: ${url}`);
      } else {
        log.success(`Opened ${url}`);
      }
    });
  } catch (err) {
    log.error(err instanceof Error ? err.message : "Failed to open endpoint");
    process.exit(1);
  }
}
