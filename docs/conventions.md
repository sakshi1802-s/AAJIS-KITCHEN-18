# Aaji's Kitchen — conventions

Source of truth: the roadmap (sections 1–11). The flow is **browse → cart → place order → Aji accepts → WhatsApp confirmation**.
Repo: `/client` (Vite + React + TS), `/server` (Express 5 + TS), `/types` (shared API contract, types only), `/n8n` (workflow export).

## Scope discipline

- Four collections (`users`, `menuItems`, `orders`, `reviews`). A fifth needs an explicit reason.
  `reviews` earned its place: a review is not tied to one order, and Aji publishes them one by one.
- The endpoint list in roadmap section 4 is the whole API, plus `GET /api/health` and
  the two password endpoints (`POST /api/auth/register`, `POST /api/auth/login`)
  added so customers can sign up without a Google account, and the four reviews
  endpoints listed in the README.
- No Redis, no queues, no websockets, no payment gateway, no GraphQL, no Docker for the app itself, no state library beyond Context plus TanStack Query.
- No slot booking, no capacity engine, no scheduling logic. Aji accepts or declines; that is the whole availability system.
- No delivery tracking, no preparing/out-for-delivery statuses. One decision, then done.
- No abstraction invented for a second use case that doesn't exist. One kitchen, one owner.

## Code conventions

- TypeScript everywhere, no `any` in committed code.
- Server layering: `route → validate (Zod) → controller → service → model`. Business logic lives in services, never in route handlers.
- Every route validates its input with Zod before the handler runs.
- Handlers `throw`; one central `errorHandler` formats `{ error: { code, message, details? } }`.
- Client: one `src/lib/api.ts` wrapper. No raw `fetch` scattered through components.
- **Money is always an integer count of paise** (DB, API, DTOs). UI converts at the edge with `rupeesToPaise` / `formatINR`.
- `requestedFor.date` is an IST calendar date string `YYYY-MM-DD`.

## Security

- JWT in an httpOnly, `sameSite=lax`, `secure` (prod) cookie. Never in localStorage.
- `userId` always from the token, never from the request body.
- Ownership checked on every `/api/orders/:id` read.
- Gemini key, Cloudinary secret, Mongo URI, JWT secret: server-side only.
- n8n webhook guarded by a shared secret header.

## Build order

- Backend before frontend inside every phase.
- Test each endpoint (supertest / Postman) before writing the component that calls it.
- Commit at each done-when gate with a real message.

## Commands

- `npm run dev` (root) — runs server (:4000) and client (:5173) together.
- `server`: `npm run dev | typecheck | test | build | seed`
- `client`: `npm run dev | typecheck | lint | build`
