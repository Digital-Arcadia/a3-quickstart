# A3 Quickstart

Minimal end-to-end example showing how to integrate the [Arcadia Age API (A3)](https://www.a3api.io) into a web application.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- An A3 API key — sign up at [portal.a3api.io](https://portal.a3api.io)

## Setup

```bash
git clone https://github.com/a3api/a3-quickstart.git
cd a3-quickstart
npm install

cp .env.example .env
# Edit .env and add your A3_API_KEY

npm run dev
```

Open http://localhost:5173, interact with the sample form (scroll, type, click around), then press **Assess Age** to see the full API response.

> **Sandbox plan note:** Free Sandbox API keys return the verdict and assessed bracket, but **omit `confidence_score` and `evidence_tags`**. The demo handles this gracefully — you'll see a note in the UI. [Upgrade to Pro](https://portal.a3api.io) to unlock the full response.

## Project structure

```
a3-quickstart/
├── client/                 React app (Vite)
│   └── src/
│       ├── main.tsx        Entry point
│       └── App.tsx         Signal collection + result display
├── server/                 Express backend
│   └── src/
│       └── index.ts        POST /api/assess-age → A3 API
├── .env.example            API key placeholder
└── package.json            Runs client + server concurrently
```

## How it works

```
Browser (@a3api/signals)  →  Your Express Server  →  A3 API
       signals                 + os_signal              verdict
                               + country_code           bracket
                               + account_age            confidence
                                                        evidence tags
```

1. **`@a3api/signals`** passively collects behavioral metrics, input complexity, device context, and contextual signals from standard browser events
2. On button click, the client POSTs the collected signals to the Express server at `/api/assess-age`
3. The server adds `os_signal: "not-available"` (browsers have no OS age signal), `user_country_code`, and calls A3 via **`@a3api/node`**
4. The full response — verdict, assessed bracket, confidence score, and evidence tags — is displayed in the browser

## Key packages

| Package | Role |
|---------|------|
| [`@a3api/signals`](https://www.npmjs.com/package/@a3api/signals) | Browser SDK — passively collects 4 of 5 signal categories |
| [`@a3api/node`](https://www.npmjs.com/package/@a3api/node) | Server SDK — calls the A3 API with retry and error handling |

## Learn more

- [Web Integration Guide](https://www.a3api.io/docs/integration/web-integration) — full walkthrough with verdict handling
- [POST /assess-age](https://www.a3api.io/docs/integration/assess-age) — API reference
- [Signal Collection](https://www.a3api.io/docs/signal-collection/overview) — deep dive into each signal category
- [Testing & CI/CD](https://www.a3api.io/docs/integration/testing) — mock server for automated tests

## License

[MIT](LICENSE)
