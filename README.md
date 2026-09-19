# Aji's Kitchen

Home-made Maharashtrian catering, ordered online. A customer browses Aji's menu, fills a cart,
places an order for a date and time of day, and Aji accepts or declines it from her own dashboard.

> Work in progress — built phase by phase from the project roadmap. Full architecture notes,
> screenshots and the deploy guide land in Phase 6.

## Stack

| | |
|---|---|
| Client | Vite · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query · React Router |
| Server | Node · Express 5 · TypeScript · Mongoose · Zod |
| Database | MongoDB Atlas (M0) |
| Auth | Google Identity Services → server-verified ID token → our own JWT in an httpOnly cookie |
| AI | Gemini Flash-Lite, server-side only, with a deterministic fallback |
| Notifications | n8n webhook seam (optional, fire-and-forget) |

## Repo layout

```
client/   Vite + React app
server/   Express API (route → validate → controller → service → model)
types/    shared API contract (plain TypeScript, no dependencies)
n8n/      importable WhatsApp notification workflow
```

## Local setup

Requires Node 22+.

```bash
npm run install:all
```

1. `server/.env` — copy from `server/.env.example`, fill `MONGODB_URI`, `JWT_SECRET`, `OWNER_EMAIL`, `GOOGLE_CLIENT_ID`, `GEMINI_API_KEY`.
2. `client/.env` — copy from `client/.env.example`, fill `VITE_GOOGLE_CLIENT_ID`.
3. Seed the menu: `npm --prefix server run seed`
4. Run both apps: `npm run dev` → client on http://localhost:5173, API on http://localhost:4000.

## Conventions

Money is always an integer count of **paise**. Every request body is validated with Zod before the
handler runs. Every error has one shape: `{ error: { code, message, details? } }`.
