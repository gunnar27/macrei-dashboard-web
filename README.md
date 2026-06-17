# MacREI Portfolio Dashboard (web)

Next.js (App Router) web dashboard for portfolio insights — the shared front-end
for MacREI's autonomous PM system. Reads from the `autonomous-pm` FastAPI
read-API; **AppFolio credentials and the read-only kill-switch live in that
backend, never here.**

## Architecture

```
Browser ─▶ this app (Vercel) ─▶ autonomous-pm read-API (Railway/Fly) ─▶ AppFolio (read-only)
```

The page is a server component: it fetches the portfolio summary on the server
each request, so no PMS data or API base is special-cased in the browser bundle.

## Run locally

1. Start the backend read-API (in the `autonomous-pm` repo):
   ```bash
   PYTHONPATH=. .venv/bin/uvicorn apps.api.main:app --port 8090
   ```
2. Start this app:
   ```bash
   cp .env.example .env.local      # adjust NEXT_PUBLIC_API_BASE_URL if needed
   npm install
   npm run dev                     # http://localhost:3000
   ```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel (framework auto-detects as Next.js).
3. Set env var **`NEXT_PUBLIC_API_BASE_URL`** to your deployed backend URL.
4. Deploy.

## Before pointing at LIVE data — required

- **Backend creds:** set production AppFolio creds + `APPFOLIO_READ_ONLY=true` on
  the *backend* (Railway/Fly), server-side only.
- **CORS / origin:** set `DASHBOARD_ORIGINS` on the backend to this app's URL.
- **Auth (do not skip):** this dashboard will show real tenant data (names,
  units, balances). Put it behind access control before exposing it — e.g.
  Vercel password protection, or an auth layer (Clerk/Auth.js) restricting to
  MacREI accounts. Do not deploy a public URL over live tenant data.

## Current screen

Portfolio overview KPIs: occupancy, total/vacant units, active tenants, open +
urgent work orders. Gross monthly rent and total past due render as "—" until the
backend's recurring-charge + delinquent-charge reads land (next backend slice).
