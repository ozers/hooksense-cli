import { createServer } from "node:http";

/** Accept the browser's form POST, not a token in a URL or a remote callback. */
export function createLoginServer(apiUrl: string, onToken: (token: string) => void) {
  const origin = new URL(apiUrl).origin;
  return createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (req.url !== "/callback") { res.writeHead(404).end(); return; }
    if (req.method !== "POST") { res.writeHead(405, { Allow: "POST" }).end(); return; }
    if (req.headers.origin !== origin) { res.writeHead(403).end("Invalid origin"); return; }
    if (!req.headers["content-type"]?.startsWith("application/x-www-form-urlencoded")) {
      res.writeHead(415).end(); return;
    }
    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk.toString();
        if (Buffer.byteLength(body) > 16_384) { res.writeHead(413).end(); return; }
      }
      const token = new URLSearchParams(body).get("token");
      if (!token || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
        res.writeHead(400).end("Missing or invalid session token"); return;
      }
      onToken(token);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<!doctype html><title>HookSense CLI</title><h1>Logged in to HookSense</h1><p>You can close this tab and return to the terminal.</p>");
    } catch {
      if (!res.headersSent) res.writeHead(500).end("Could not complete login");
    }
  });
}
