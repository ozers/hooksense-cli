<div align="center">

# hooksense

**Capture, inspect, and forward webhooks to your local dev server.**

[![npm version](https://img.shields.io/npm/v/hooksense.svg)](https://www.npmjs.com/package/hooksense)
[![npm downloads](https://img.shields.io/npm/dm/hooksense.svg)](https://www.npmjs.com/package/hooksense)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[Website](https://hooksense.com) · [Documentation](https://hooksense.com/docs/cli) · [Integration Guides](https://hooksense.com/integrations) · [Issues](https://github.com/ozers/hooksense-cli/issues)

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
- **Real-time forwarding** — webhooks hit your localhost in milliseconds via WebSocket
- **Auto-reconnect** — drops connection? reconnects with backoff automatically
- **Colored output** — method, content-type, size, response status at a glance
- **HMAC verification** — verify Stripe, GitHub, Shopify webhook signatures on [hooksense.com](https://hooksense.com)
- **One-click replay** — resend any captured webhook from the [web dashboard](https://hooksense.com)
- **Works with any framework** — Express, Next.js, FastAPI, Rails, Django, anything on localhost

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

Listen for incoming webhooks and forward them to your local server.

```bash
# Create new endpoint + forward
hooksense listen --forward http://localhost:3000/webhook

# Use existing endpoint
hooksense listen abc12345 --forward http://localhost:3000/webhook

# Forward to a specific path
hooksense listen --forward http://localhost:3000/api/stripe

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

### `hooksense status`

Show current login and connection status.

```bash
hooksense status
```

## Options

| Flag | Description |
|------|-------------|
| `-f, --forward <url>` | URL to forward incoming webhooks to |
| `--api <url>` | Override API server URL |

Set `HOOKSENSE_API` environment variable to change the default API URL.

## Use Cases

- **Stripe webhooks** — test `checkout.session.completed`, `invoice.paid`, and payment events locally ([guide](https://hooksense.com/integrations/stripe))
- **GitHub webhooks** — debug `push`, `pull_request`, and `deployment` events on your machine ([guide](https://hooksense.com/integrations/github))
- **Shopify webhooks** — develop apps with `orders/create` and `products/update` events without deploying ([guide](https://hooksense.com/integrations/shopify))
- **Twilio webhooks** — test SMS delivery callbacks and voice status events ([guide](https://hooksense.com/integrations/twilio))
- **Slack webhooks** — debug slash commands, interactive components, and Events API ([guide](https://hooksense.com/integrations/slack))
- **SendGrid webhooks** — capture email delivery, open, click, and bounce events ([guide](https://hooksense.com/integrations/sendgrid))
- **Any webhook provider** — works with everything that sends HTTP requests

## Why HookSense CLI?

| Feature | HookSense CLI | ngrok | Stripe CLI |
|---------|:---:|:---:|:---:|
| Persistent URL | ✅ | ❌ (changes on free) | ❌ (temporary) |
| Webhook history | ✅ (7-90 days) | ❌ | ❌ |
| One-click replay | ✅ (via web) | ❌ | ❌ |
| HMAC verification | ✅ (via web) | ❌ | ❌ |
| Works with any provider | ✅ | ✅ | ❌ (Stripe only) |
| No signup required | ✅ | ❌ | ❌ |
| Free tier | ✅ | ✅ (limited) | ✅ |

## HookSense Web Dashboard

The CLI works with the [HookSense web dashboard](https://hooksense.com) which provides:

- **Real-time webhook inspection** — see headers, body, query params instantly
- **HMAC signature verification** — built-in for Stripe, GitHub, Shopify
- **Request replay** — resend any webhook to any URL with one click
- **Request comparison** — side-by-side diff of two webhook payloads
- **Export** — download as cURL, JSON, or CSV
- **Monitoring & alerts** — uptime tracking, error rate alerts

[Try it free](https://hooksense.com) — no signup required.

## Links

- [HookSense Website](https://hooksense.com)
- [CLI Documentation](https://hooksense.com/docs/cli)
- [API Reference](https://hooksense.com/docs/api)
- [Integration Guides](https://hooksense.com/integrations)
- [Blog](https://hooksense.com/blog)
- [HMAC Calculator Tool](https://hooksense.com/tools/hmac-calculator)

## License

MIT
