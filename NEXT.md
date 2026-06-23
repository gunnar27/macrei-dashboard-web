# NEXT — macrei-dashboard-web (frontend handoff)

**Updated:** 2026-06-22 · branch `main`. **2 commits ahead of origin — NOT pushed.** The
backend GL-throttle blocker is now resolved in code (financials are served from a Postgres
cache); deploy is gated only on provisioning Postgres + running the first sync — see the
backend `NEXT.md` "GL cache built" block.
Pairs with the backend handoff in `autonomous-pm/docs/NEXT.md` (read both).

## ▶ 2026-06-22b — "Last synced" surfaced
- `synced_at` added to `PortfolioFinancials`/`PortfolioFinancialsTrend` types; the Financial
  Trend header now shows `Synced <time>` (war-room "last synced" ask). No other UI change.

## ▶ 2026-06-22 — Financial Trend section added (time dimension)
- `app/components/TrendSection.tsx` — lazy client section, Recharts `ComposedChart`
  (income + expense bars, NOI line) + period-over-period NOI delta chip. Mounted in
  `app/page.tsx` above `<FinancialsSection>`.
- `app/api/financials/trend/route.ts` — same-origin proxy → backend
  `/api/portfolio/financials/trend?months=N`. `fetchFinancialsTrend` + types in `lib/api.ts`.
- `npm run build` passes. Renders correct shape against the live backend; recent months read
  $0 (sparse test-site GL). **Do not deploy until the backend GL throttle is resolved** (12-mo
  default would leave the section on "Loading monthly ledger…").
- Remaining war-room build order is unchanged below (drill-down `/buildings/[id]` next).

## What this is
Next.js 15.5 (App Router) + React 19 + Recharts 3 analytics dashboard for MacREI's
multifamily portfolio. Dark institutional theme, Inter font, tabular numbers. It is a thin
front-end: all data comes from the `autonomous-pm` FastAPI read-API. No AppFolio creds here.

## Architecture
```
Browser ─▶ this app (Vercel) ─▶ autonomous-pm read-API (Railway) ─▶ AppFolio (read-only)
```
- `lib/api.ts` — typed client + `API_BASE` from `NEXT_PUBLIC_API_BASE_URL`.
- `app/page.tsx` — server component, fetches `/summary` + `/buildings` in parallel; renders
  KPIs + occupancy ring + By-Building charts/table + `<FinancialsSection>`.
- `app/components/BuildingCharts.tsx` — occupancy + rent bar charts (client).
- `app/components/FinancialsSection.tsx` — client, lazy-loads `/api/financials` (a Next route
  handler `app/api/financials/route.ts` that server-side-proxies the backend → no CORS).

## Deploy
- GitHub: https://github.com/gunnar27/macrei-dashboard-web
- Vercel: framework Next.js, root dir blank. Env var **`NEXT_PUBLIC_API_BASE_URL`** =
  `https://autonomous-pm-production.up.railway.app`. Behind Vercel Deployment Protection
  (login-gated — keep it, real tenant data is coming).
- Verify build locally: `npm install && npm run build`.

## Design direction (war room — `design-war-room-20260618.md`)
Build order: (1) **time dimension** — monthly Income/Expense/NOI trend chart + KPI sparklines
(unanimous #1 gap); (2) per-building drill-down route `/buildings/[id]`; (3) lease-expiration
+ delinquency-aging views; (4) polish — dedupe KPIs, demote the occupancy donut, one accent
color, period-over-period delta arrows, "last synced" timestamp, conditional formatting in
tables. Keep dark theme. Consider a light left-nav as Leasing/Maintenance views arrive.

## Before pointing at LIVE (prod) tenant data
- Backend: prod AppFolio creds + `APPFOLIO_READ_ONLY=true`, server-side only.
- Add auth in front of this app (it shows tenant data). Vercel protection is the interim gate.

## Known notes
- Test-site quirks (will be real on prod): past due looks inflated (sandbox cruft); expenses
  light vs income (sparse GL postings).
