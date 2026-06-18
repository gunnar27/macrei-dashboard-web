# Design War Room — MacREI Dashboard → Institutional Grade
**Date:** 2026-06-18 · 5 advisors + 3 peer reviews + chairman synthesis

## Anonymization map
- A = Executor · B = Contrarian · C = First Principles · D = Expansionist · E = Outsider

---

## Where the council AGREES (high confidence)

1. **No time dimension is the #1 gap — unanimous.** Every advisor independently said the single biggest thing holding it back is that everything is a snapshot. "94% occupancy is neutral; 97%→94% over 90 days is a fire alarm." Trend lines (NOI/income/expense by month) + sparklines turn reporting into analytics. This beats any visual change.
2. **Drill-down is required.** You must be able to click a building → unit-level detail (who's late, lease expirations, rent vs market, WO aging, that building's GL trend). 4 of 5 said so.
3. **Sparklines inside KPI cards** — 90-day trend at zero layout cost (A, C, D).
4. **Keep dark; ONE accent color used as signal, not decoration** (C, D; A gave a concrete palette). Add faint grid, tabular/mono numbers, thin dividers, styled tooltips, conditional formatting (red/amber/green).
5. **Lease expiration view** (30/60/90 buckets or heatmap) — every advisor named it; it's the only forward-looking view.
6. **Delinquency aging by building** (30/60/90), not just a total (B, E).
7. **Trust = audit trail.** Source attribution, "last synced" timestamp, and period-over-period deltas on every figure (A, B, C).

## Where the council CLASHES

- **IA: one page vs. multi-view.** Four advisors (A/B/D/E) say kill the single scroll → sidebar nav + per-building drill-down *pages* (the Addepar Portfolio→Asset→Unit model). One (C, First Principles) argues KEEP one scrolling page at 118-unit scale and use progressive disclosure + a slide-out panel/modal for drill-down ("modal keeps context; a new page loses it"). 
- **Polish-first vs. data-first.** The Executor (A) gives a fast visual/IA ship plan; the Contrarian (B) says fix the data model (time + context) before any polish, or you "polish a broken instrument." Peer reviewers sided hard with B on sequencing.

## Blind spots peer review caught

1. **Verify the suspect numbers first.** Past Due ($223,942) ≈ one month's gross rent, and Open Work Orders = 0 for 118 units. Every advisor treated these as design problems; none said "stop and confirm the data is real." (We know the answers: 0 WOs is correct — they were all on the off-boarded "10th," now excluded; past due is test-site accumulated cruft, will be real on prod. But the dashboard must make numbers self-explaining so they pass a smell test.)
2. **Role-based views / data governance** — LP view vs. operator view need different exposure + permissions + lineage.
3. **Mobile/responsive** — a GP checking between site visits, an LP on a phone. Does dark+dense+tabular survive 390px?

## THE RECOMMENDATION

Build the **time dimension first**, then **drill-down**, then **trust signals** — in that order. Visual polish rides along but is not the lever.

On the IA clash, the chairman sides with a **hybrid**: at 118 units, don't over-build a full multi-page app yet — keep a fast overview, add **per-building drill-down** (start as a route `/buildings/[id]`, which Next makes trivial and reads as institutional) and a **light top/side nav** that pays off as Leasing/Maintenance views arrive. C's "preserve context" instinct is right — but drill-down depth (D/B) is non-negotiable for credibility. Do both: drill-down route + keep the overview tight.

Concrete design upgrades: kill the duplicate Rent/Past-Due cards; demote the donut to a compact KPI (it's the biggest element for one number); add monthly trend charts (NOI/income/expense ComposedChart); sparklines in KPI cards; period-over-period delta arrows; conditional formatting in tables; lease-expiration 30/60/90 view; delinquency aging by building; "last synced" timestamp + source attribution.

## THE ONE THING TO DO FIRST

**Add the time axis: a monthly Income / Expense / NOI trend chart (from `/gl_details` dates) plus sparklines on the KPI cards.** Every advisor, independently, named the missing time dimension as the single biggest gap. It's the change that converts this from a report into an analytics platform — and the data is already there.
