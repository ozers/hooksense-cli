import { execFile } from "node:child_process";

export function openBrowser(url: string): Promise<void> {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Expected an HTTP(S) URL");
  // Arguments never pass through a shell, including on Windows.
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "rundll32.exe" : "xdg-open";
  const args = process.platform === "win32" ? ["url.dll,FileProtocolHandler", parsed.href] : [parsed.href];
  return new Promise((resolve, reject) => execFile(command, args, (error) => error ? reject(error) : resolve()));
}
