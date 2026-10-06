import { setToken, clearToken, getApiUrl } from "../lib/config.js";
import { log } from "../ui/logger.js";
import { openBrowser } from "../lib/browser.js";
import { createLoginServer } from "../lib/login-server.js";

export async function loginCommand() {
  const apiUrl = getApiUrl();
  let timer: ReturnType<typeof setTimeout>;
  const server = createLoginServer(apiUrl, (token) => {
    setToken(token);
    clearTimeout(timer);
    log.success("Logged in successfully");
    server.close();
  });
  server.on("error", (error) => {
    clearTimeout(timer);
    log.error(error.message);
    process.exitCode = 1;
  });
  // Match the backend's localhost form action, without binding network interfaces.
  server.listen(0, "localhost", () => {
    const address = server.address();
    if (!address || typeof address === "string") return;
    const url = `${apiUrl}/api/auth/cli?port=${address.port}`;
    log.info("Opening browser to log in...");
    log.dim(url);
    void openBrowser(url).catch(() => log.info(`Open in browser: ${url}`));
    log.info("Waiting for login...");
    timer = setTimeout(() => {
      log.error("Login timed out");
      server.close();
      server.closeAllConnections();
      process.exitCode = 1;
    }, 120_000);
  });
}

export async function logoutCommand() {
  clearToken();
  log.success("Logged out");
}
