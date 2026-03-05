import pc from "picocolors";

function timestamp(): string {
  const now = new Date();
  return pc.dim(
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function methodColor(method: string): string {
  switch (method) {
    case "GET": return pc.green(method);
    case "POST": return pc.yellow(method);
    case "PUT": return pc.blue(method);
    case "PATCH": return pc.magenta(method);
    case "DELETE": return pc.red(method);
    default: return pc.white(method);
  }
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return pc.green(`${status}`);
  if (status >= 300 && status < 400) return pc.yellow(`${status}`);
  if (status >= 400) return pc.red(`${status}`);
  return pc.gray(`${status}`);
}

export const log = {
  banner(endpointUrl: string, forwardUrl?: string) {
    console.log();
    console.log(`  ${pc.bold(pc.cyan("HookSense"))} ${pc.dim("— Webhook forwarder")}`);
    console.log();
    console.log(`  ${pc.dim("Endpoint:")}  ${pc.white(endpointUrl)}`);
    if (forwardUrl) {
      console.log(`  ${pc.dim("Forward:")}   ${pc.white(forwardUrl)}`);
    }
    console.log(`  ${pc.dim("Status:")}    ${pc.green("● Connected")}`);
    console.log();
  },

  request(method: string, contentType: string | null, sizeBytes: number) {
    const ct = contentType || "unknown";
    const size = formatBytes(sizeBytes);
    process.stdout.write(
      `  ${timestamp()}  ${methodColor(method.padEnd(6))}  ${pc.dim(ct.padEnd(20))}  ${pc.dim(size.padStart(8))}  `
    );
  },

  forward(status: number, statusText: string, durationMs: number) {
    console.log(
      `${pc.dim("→")} ${statusColor(status)} ${pc.dim(statusText)} ${pc.dim(`(${durationMs}ms)`)}`
    );
  },

  forwardError(error: string) {
    console.log(`${pc.dim("→")} ${pc.red("Error:")} ${pc.red(error)}`);
  },

  connected() {
    console.log(`  ${pc.dim("Status:")}    ${pc.green("● Connected")}`);
  },

  disconnected() {
    console.log(`  ${pc.dim("Status:")}    ${pc.yellow("○ Disconnected")}`);
  },

  info(msg: string) {
    console.log(`  ${pc.dim(msg)}`);
  },

  success(msg: string) {
    console.log(`  ${pc.green("✓")} ${msg}`);
  },

  error(msg: string) {
    console.error(`  ${pc.red("✗")} ${msg}`);
  },

  dim(msg: string) {
    console.log(`  ${pc.dim(msg)}`);
  },
};
