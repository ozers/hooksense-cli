# hooksense

CLI tool for [HookSense](https://hooksense.com) — capture, inspect, and forward webhooks to your local development server.

## Install

```bash
npm install -g hooksense
```

Or use directly with npx:

```bash
npx hooksense listen --forward http://localhost:3000/webhook
```

## Usage

### Listen for webhooks

```bash
# Create a new endpoint and forward webhooks to localhost
hooksense listen --forward http://localhost:3000/webhook

# Listen on an existing endpoint
hooksense listen <slug> --forward http://localhost:3000/webhook
```

Output:

```
  HookSense — Webhook forwarder

  Endpoint:  https://hooksense.com/w/abc12345
  Forward:   http://localhost:3000/webhook
  Status:    ● Connected

  12:34:01  POST    application/json      1.2KB  → 200 OK (23ms)
  12:34:05  POST    application/json      856B   → 200 OK (18ms)
  12:34:12  PUT     text/plain            128B   → 404 Not Found (5ms)
```

### Create an endpoint

```bash
hooksense create
```

### Authentication

```bash
# Log in for more endpoints and longer retention
hooksense login

# Log out
hooksense logout
```

### Options

| Flag | Description |
|------|-------------|
| `--forward <url>` | URL to forward incoming webhooks to |
| `--api <url>` | Override API server URL |

You can also set `HOOKSENSE_API` environment variable to override the default API URL.

## License

MIT
