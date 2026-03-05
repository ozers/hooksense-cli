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

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
}

export const log = {
  banner(endpointUrl: string, forwardUrl?: string, filter?: string | null) {
    console.log();
    console.log(pc.cyan(`    ██╗  ██╗`));
    console.log(pc.cyan(`    ██║  ██║`) + `   ${pc.bold(pc.white("HookSense"))}`);
    console.log(pc.cyan(`    ██║  ╚═╝`) + `   ${pc.dim("Webhook forwarder")}`);
    console.log(pc.cyan(`    ██║  ╔══════╗`));
    console.log(pc.cyan(`    ╚═╝  ╚══════╝`));
    console.log();
    console.log(`  ${pc.dim("Endpoint:")}  ${pc.white(endpointUrl)}`);
    if (forwardUrl) {
      console.log(`  ${pc.dim("Forward:")}   ${pc.white(forwardUrl)}`);
    }
    if (filter) {
      console.log(`  ${pc.dim("Filter:")}    ${methodColor(filter)} ${pc.dim("only")}`);
    }
    console.log(`  ${pc.dim("Status:")}    ${pc.green("● Connected")}`);
    console.log();
  },

  request(method: string, contentType: string | null, sizeBytes: number, sourceIp: string | null) {
    const ct = contentType || pc.dim("—");
    const size = formatBytes(sizeBytes);
    const ip = sourceIp ? pc.dim(`${sourceIp}`) : "";
    process.stdout.write(
      `  ${timestamp()}  ${methodColor(method.padEnd(6))}  ${ct.padEnd(20)}  ${pc.dim(size.padStart(8))}  ${ip ? ip + "  " : ""}`
    );
  },

  requestBody(body: string, contentType: string | null) {
    const isJson = contentType?.includes("json");
    let display = body;
    if (isJson) {
      try {
        display = JSON.stringify(JSON.parse(body), null, 2);
      } catch {}
    }
    const lines = truncate(display, 500).split("\n");
    for (const line of lines) {
      console.log(`           ${pc.dim("│")} ${pc.cyan(line)}`);
    }
  },

  responseBody(body: string) {
    const lines = truncate(body, 500).split("\n");
    for (const line of lines) {
      console.log(`           ${pc.dim("│")} ${pc.dim(line)}`);
    }
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

  summary(total: number, forwarded: number, failed: number, skipped: number, durationSecs: number) {
    console.log();
    console.log(`  ${pc.dim("─".repeat(50))}`);
    console.log(`  ${pc.bold("Session summary")}`);
    console.log(`  ${pc.dim("Duration:")}   ${formatDuration(durationSecs)}`);
    console.log(`  ${pc.dim("Received:")}   ${total} request${total !== 1 ? "s" : ""}`);
    if (forwarded > 0) {
      console.log(`  ${pc.dim("Forwarded:")}  ${pc.green(String(forwarded))} OK`);
    }
    if (failed > 0) {
      console.log(`  ${pc.dim("Failed:")}     ${pc.red(String(failed))}`);
    }
    if (skipped > 0) {
      console.log(`  ${pc.dim("Skipped:")}    ${pc.yellow(String(skipped))} ${pc.dim("(filtered)")}`);
    }
    console.log();
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
