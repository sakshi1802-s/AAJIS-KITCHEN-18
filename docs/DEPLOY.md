# Deploying

Three free services: **Vercel** (client), **Render** (API), **MongoDB Atlas**
(database). You'll need to be logged in to each — these steps are yours to run.

## 1. Atlas

- Network Access → add `0.0.0.0/0`. Render's free tier has no fixed outbound
  IP, so an IP allowlist won't work.
- Keep using the same connection string, including a database name:
  `...mongodb.net/aji_kitchen?retryWrites=true&w=majority`.
- Seed the menu once against the production database:
  `MONGODB_URI="<prod uri>" npm --prefix server run seed`

## 2. Render (the API)

- New → Blueprint, point it at the repo. It picks up [render.yaml](../render.yaml).
- Or, by hand: Root Directory `server`, Build `npm ci && npm run build`,
  Start `node dist/index.js`, Health check path `/api/health`.
- Fill in the environment variables the blueprint leaves blank:
  `MONGODB_URI`, `CLIENT_ORIGIN`, `OWNER_EMAIL`, `GOOGLE_CLIENT_ID`,
  `GEMINI_API_KEY`. `JWT_SECRET` is generated for you — **it must not** be the
  dev one.
- Note the service URL, e.g. `https://aji-kitchen-api.onrender.com`.

> The free instance sleeps after inactivity, so the first request of the day
> takes ~30 seconds. Worth knowing before a demo.

## 3. Vercel (the client)

- Import the repo, set **Root Directory** to `client`. Framework preset: Vite.
- Edit [client/vercel.json](../client/vercel.json) and replace the Render host in the
  `/api/:path*` rewrite with your own. That rewrite is what keeps the client
  and API on one origin, so the session cookie stays first-party.
- Environment variable: `VITE_GOOGLE_CLIENT_ID` (the same client ID).
  Leave `VITE_API_URL` unset — same-origin is the point.
- Deploy, and note the domain, e.g. `https://ajis-kitchen.vercel.app`.

## 4. Join the two up

- Back on Render, set `CLIENT_ORIGIN` to the Vercel domain and redeploy.
- Google Cloud Console → your OAuth client → **Authorised JavaScript origins**:
  add the Vercel domain. Still no redirect URI, still no client secret.
- If the consent screen is in Testing mode, add Aji's Google account as a test
  user, or publish the app.

## 5. Check it end to end

1. `https://<your-domain>/api/health` returns `{"status":"ok","db":"connected"}`.
2. Open the site in a private window, browse the menu logged out.
3. Sign in with Google, place a small order.
4. Sign in as Aji on a phone, accept it, watch the customer's status change.

## Production checklist

- [ ] `JWT_SECRET` on Render is not the development value
- [ ] `NODE_ENV=production`, so the session cookie is `Secure`
- [ ] `CLIENT_ORIGIN` is the exact Vercel domain, no trailing slash
- [ ] The Vercel rewrite points at the real Render host
- [ ] Atlas allows `0.0.0.0/0` and the production menu is seeded
- [ ] Vercel domain is in the OAuth client's authorised origins
- [ ] `GEMINI_API_KEY` is set on the server only — never in a `VITE_` variable
