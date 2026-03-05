<div align="center">

# hooksense

**Capture, inspect, and forward webhooks to your local dev server.**

[![npm version](https://img.shields.io/npm/v/hooksense.svg)](https://www.npmjs.com/package/hooksense)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[Website](https://hooksense.com) · [Dashboard](https://hooksense.com) · [Issues](https://github.com/ozers/hooksense-cli/issues)

</div>

---

No signup required. Get a public webhook URL in seconds and forward requests to `localhost`.

```bash
npx hooksense listen --forward http://localhost:3000/webhook
```

```
  HookSense — Webhook forwarder

  Endpoint:  https://hooksense.com/w/abc12345
  Forward:   http://localhost:3000/webhook
  Status:    ● Connected

  12:34:01  POST    application/json      1.2KB  → 200 OK (23ms)
  12:34:05  POST    application/json      856B   → 200 OK (18ms)
  12:34:12  PUT     text/plain            128B   → 404 Not Found (5ms)
```

## Features

- **Instant webhook URL** — no signup, no config files
- **Real-time forwarding** — webhooks hit your localhost in milliseconds
- **Auto-reconnect** — drops connection? reconnects with backoff automatically
- **Colored output** — method, content-type, size, response status at a glance
- **Works with any framework** — Express, Next.js, FastAPI, Rails, anything on localhost

## Install

```bash
npm install -g hooksense
```

Or run directly:

```bash
npx hooksense listen --forward http://localhost:3000/webhook
```

## Commands

### `hooksense listen [slug]`

Listen for incoming webhooks and optionally forward them.

```bash
# Create new endpoint + forward
hooksense listen --forward http://localhost:3000/webhook

# Use existing endpoint
hooksense listen abc12345 --forward http://localhost:3000/webhook

# Just listen (no forwarding)
hooksense listen abc12345
```

### `hooksense create`

Create a new webhook endpoint and print the URL.

```bash
hooksense create
```

### `hooksense login` / `hooksense logout`

Authenticate for more endpoints and longer data retention.

```bash
hooksense login
hooksense logout
```

## Options

| Flag | Description |
|------|-------------|
| `-f, --forward <url>` | URL to forward incoming webhooks to |
| `--api <url>` | Override API server URL |

Set `HOOKSENSE_API` environment variable to change the default API URL.

## Use Cases

- **Stripe webhooks** — test payment events locally
- **GitHub webhooks** — debug push/PR events on your machine
- **Shopify webhooks** — develop apps without deploying
- **Any webhook provider** — works with everything that sends HTTP requests

## License

MIT
