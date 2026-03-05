import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { login as apiLogin } from "../lib/api.js";
import { setToken, clearToken } from "../lib/config.js";
import { log } from "../ui/logger.js";

export async function loginCommand() {
  const rl = readline.createInterface({ input, output });

  try {
    const email = await rl.question("  Email: ");
    // Use raw mode for password input
    const password = await new Promise<string>((resolve) => {
      process.stdout.write("  Password: ");
      const chars: string[] = [];

      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
      }
      process.stdin.resume();
      process.stdin.setEncoding("utf-8");

      const onData = (char: string) => {
        switch (char) {
          case "\n":
          case "\r":
          case "\u0004": // Ctrl+D
            process.stdin.setRawMode?.(false);
            process.stdin.pause();
            process.stdin.removeListener("data", onData);
            console.log();
            resolve(chars.join(""));
            break;
          case "\u0003": // Ctrl+C
            process.stdin.setRawMode?.(false);
            console.log();
            process.exit(0);
            break;
          case "\u007f": // Backspace
            if (chars.length > 0) {
              chars.pop();
              process.stdout.write("\b \b");
            }
            break;
          default:
            chars.push(char);
            process.stdout.write("*");
        }
      };

      process.stdin.on("data", onData);
    });

    console.log();
    log.info("Logging in...");

    const { token } = await apiLogin(email, password);
    setToken(token);

    log.success("Logged in successfully");
    console.log();
  } catch (err) {
    log.error(err instanceof Error ? err.message : "Login failed");
    process.exit(1);
  } finally {
    rl.close();
  }
}

export async function logoutCommand() {
  clearToken();
  log.success("Logged out");
}
