# Client — Aji's Kitchen

Vite + React 19 + TypeScript, Tailwind v4, shadcn/ui, TanStack Query, React Router.

```bash
npm run dev        # http://localhost:5173, proxies /api to the server on :4000
npm run dev:host   # same, reachable from a phone on the same Wi-Fi
npm run typecheck
npm test
npm run lint
npm run build
```

Copy `.env.example` to `.env`. Everything in it ships to the browser, so it
holds no secrets — only `VITE_GOOGLE_CLIENT_ID` and the optional Cloudinary
preset.

## Two things worth knowing

**The API is same-origin.** In development, Vite proxies `/api` to Express; in
production, [vercel.json](vercel.json) rewrites `/api/*` to Render. That keeps the
session cookie first-party, so `SameSite=Lax` is enough and there's no
third-party-cookie problem to work around. The rewrite host has to be changed
to your own Render URL before deploying.

**Money is paise.** `MenuItemDTO.price`, order totals, everything. Rupees exist
only at the edges: `formatINR` for display and `rupeesToPaise` in the owner's
dish form.
