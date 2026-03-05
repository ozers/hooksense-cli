import * as http from "node:http";
import { setToken, clearToken, getApiUrl } from "../lib/config.js";
import { log } from "../ui/logger.js";

export async function loginCommand() {
  const apiUrl = getApiUrl();

  // Start a local HTTP server to receive the callback
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://localhost`);

    if (url.pathname === "/callback") {
      const token = url.searchParams.get("token");

      if (token) {
        setToken(token);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <body style="background:#0a0a0a;color:#e4e4e7;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
              <div style="text-align:center">
                <h1 style="font-size:24px;margin-bottom:8px">&#10003; Logged in to HookSense</h1>
                <p style="color:#71717a">You can close this tab and return to the terminal.</p>
              </div>
            </body>
          </html>
        `);
        log.success("Logged in successfully");
        console.log();
        setTimeout(() => { server.close(); process.exit(0); }, 500);
      } else {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <body style="background:#0a0a0a;color:#ef4444;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
              <div style="text-align:center">
                <h1 style="font-size:24px">Login failed</h1>
                <p style="color:#71717a">No token received. Please try again.</p>
              </div>
            </body>
          </html>
        `);
        log.error("Login failed — no token received");
        setTimeout(() => { server.close(); process.exit(1); }, 500);
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  // Listen on a random available port
  server.listen(0, () => {
    const addr = server.address();
    if (!addr || typeof addr === "string") {
      log.error("Failed to start local server");
      process.exit(1);
    }

    const port = addr.port;
    const loginUrl = `${apiUrl}/api/auth/cli?port=${port}`;

    console.log();
    log.info("Opening browser to log in...");
    log.dim(loginUrl);
    console.log();

    // Open browser
    import("node:child_process").then(({ exec }) => {
      const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
      exec(`${cmd} "${loginUrl}"`);
    });

    log.info("Waiting for login...");

    // Timeout after 2 minutes
    setTimeout(() => {
      log.error("Login timed out");
      server.close();
      process.exit(1);
    }, 120_000);
  });
}

export async function logoutCommand() {
  clearToken();
  log.success("Logged out");
}
