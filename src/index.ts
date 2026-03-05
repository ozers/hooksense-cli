#!/usr/bin/env node

import { Command } from "commander";
import { listenCommand } from "./commands/listen.js";
import { createCommand } from "./commands/create.js";
import { loginCommand, logoutCommand } from "./commands/auth.js";
import { listCommand } from "./commands/list.js";
import { inspectCommand } from "./commands/inspect.js";
import { setApiUrl } from "./lib/config.js";

const program = new Command();

program
  .name("hooksense")
  .description("HookSense CLI — capture, inspect, and forward webhooks")
  .version("0.1.0")
  .option("--api <url>", "API server URL (default: https://hooksense.com)")
  .hook("preAction", (thisCommand) => {
    const apiUrl = thisCommand.opts().api;
    if (apiUrl) {
      setApiUrl(apiUrl);
    }
  });

program
  .command("listen [slug]")
  .description("Listen for webhooks and optionally forward them to a local URL")
  .option("-f, --forward <url>", "URL to forward incoming webhooks to")
  .option("-p, --port <port>", "Shorthand for --forward http://localhost:<port>")
  .option("--filter <method>", "Only forward requests with this HTTP method (e.g. POST)")
  .option("-v, --verbose", "Show request and response bodies")
  .option("-n, --new", "Force create a new endpoint")
  .action(listenCommand);

program
  .command("create")
  .description("Create a new webhook endpoint")
  .action(createCommand);

program
  .command("list")
  .alias("ls")
  .description("List your endpoints")
  .action(listCommand);

program
  .command("inspect <slug>")
  .alias("open")
  .description("Open endpoint dashboard in the browser")
  .action(inspectCommand);

program
  .command("login")
  .description("Log in to your HookSense account")
  .action(loginCommand);

program
  .command("logout")
  .description("Log out of your HookSense account")
  .action(logoutCommand);

program.parse();
