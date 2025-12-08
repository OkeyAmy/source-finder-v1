# Quack × ChainGPT Agent (source-finder-v1)

A Next.js prototype integrating ChainGPT streaming responses with a q402-style payment-protected action flow (x402). This repository demonstrates:

- Streaming AI responses into a client chat UI.
- An agent-driven q402 payload generation flow: the model emits marker-wrapped JSON which the client extracts and forwards to guarded endpoints.
- A q402 middleware wrapper that returns `402` payment offers and validates Base64 `x-payment` headers.
- Optional auto-settlement using a sponsor `viem` wallet client.

> WARNING: This is a development prototype. Defaults are relaxed for testing. Read "Security & Hardening" before using real keys or deploying to mainnet.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
	- [Prerequisites](#prerequisites)
	- [Environment Variables](#environment-variables)
	- [Run Locally](#run-locally)
- [Key Routes / Files](#key-routes--files)
- [q402 middleware behavior](#q402-middleware-behavior)
- [Security & Hardening](#security--hardening)
- [Development Notes](#development-notes)
- [Next Steps / TODOs](#next-steps--todos)
- [Contributing](#contributing)

---

## Features

- Streaming chat UI (`chat-interface.tsx`) that appends model chunks as they arrive.
- `payload` mode in the generator route to produce marker-wrapped q402 JSON payloads.
- Client parsing that extracts marker-wrapped JSON even when markers are split across stream chunks.
- `withQ402Payment` middleware (`lib/q402/middleware.ts`) that offers payment details and validates incoming Base64 `x-payment` headers.
- Example protected endpoint: `/api/execute-transfer`.

## Architecture

- Next.js (app router) server routes under `app/api/*`.
- Client React UI at `chat-interface.tsx` (local experiment layout).
- `lib/chaingpt/client.ts` handles ChainGPT streaming integration.
- `lib/q402/middleware.ts` wraps endpoints with payment negotiation and verification logic.

## Getting Started

### Prerequisites

- Node.js 18+ and `pnpm` installed.
- An RPC URL for the network you want to test against (BSC Testnet used in examples).

### Environment Variables

Create a `.env.local` (or export env vars) with the values below. All `Q402_*` values are required for `execute-transfer` to operate as configured in this repo.

- `RPC_URL` — JSON-RPC URL for the chain.
- `Q402_RECIPIENT_ADDRESS` — recipient address used in middleware suggestions (string).
- `Q402_IMPLEMENTATION_CONTRACT` — implementation contract address (string).
- `Q402_VERIFYING_CONTRACT` — verifying contract address (string).
- `SPONSOR_PRIVATE_KEY` — sponsor private key (32-byte hex). MUST be `0x` + 64 hex chars. Example:

	```bash
	export SPONSOR_PRIVATE_KEY=0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
	```

Do not commit secrets to the repo.

### Run Locally

Install and start the dev server:

```bash
pnpm install
pnpm dev
```

If environment variables are not valid (especially `SPONSOR_PRIVATE_KEY`), the server will show a clear error indicating the required format.

## Key Routes / Files

- `chat-interface.tsx` — Client-side chat UI and streaming parser for q402 payloads.
- `app/api/chaingpt/generate/route.ts` — Generator route; supports `mode: 'payload'`.
- `app/api/chaingpt/chat/route.ts` — Chat stream route for general responses.
- `app/api/execute-transfer/route.ts` — Example q402-protected endpoint wrapped by `withQ402Payment`.
- `app/api/q402/start/route.ts` — Development receiver for AI-parsed payloads.
- `lib/q402/middleware.ts` — Middleware that creates 402 offers, decodes/validates `x-payment`, and optionally settles.
- `lib/chaingpt/client.ts` — ChainGPT streaming helper.

## q402 middleware behavior

- Missing `x-payment` header -> returns `402` with `accepts` payment suggestions (EIP-7702-like).
- Incoming `x-payment` header is Base64-decoded and passed to `verifyPayment` (from `@q402/core`).
- Middleware by default enforces strict equality for `token`, `amount`, and `to`; for development flows this repo allows endpoints to set `amount: 'any'` and `allowAnyRecipient: true` to accept AI-generated payloads.
- When `autoSettle` is enabled the middleware attempts to call `settlePayment` with the configured `walletClient`.

## Security & Hardening

This project relaxes protections for prototyping. Before production use:

- Avoid `amount: 'any'` and `allowAnyRecipient: true` in production. Instead, permit a maximum amount or require the recipient to be the configured `Q402_RECIPIENT_ADDRESS`.
- Persist and check `paymentId` server-side to prevent replay attacks and bind payments to payload hashes.
- Use secure key management (hardware wallets, KMS) rather than raw env vars for sponsor keys.
- Audit settlement code and add rate-limiting and logging.

## Development Notes

- The generator route uses prompt engineering to instruct the model to output only a JSON payload between `[Q402-PAYLOAD]...[/Q402-PAYLOAD]` markers. The client collects stream chunks, finds the markers, and extracts the JSON.
- The client sends the parsed payload to `/api/execute-transfer` with the payment encoded as Base64 in the `x-payment` header and `txPayload` (if present) in the request body.
- `execute-transfer` validates the sponsor key format at startup to prevent `privateKeyToAccount` runtime errors.

## Next Steps / TODOs

- Add `paymentId` storage and replay protection.
- Add an upper-bound check for amounts so endpoints can accept flexible amounts safely.
- Implement end-to-end tests for the streaming + q402 flow.
- Harden prompts and parsing to reduce brittleness.

## Contributing

Fork and open a PR. For architecture changes (settlement design, key management), open an issue first.

## License

No license file is included. Add one (e.g., MIT) if you plan to publish.

---