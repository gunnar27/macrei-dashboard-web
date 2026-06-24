"use client";

import { useEffect, useMemo, useState } from "react";
import type { MonthlyFinancials, PortfolioFinancialsTrend } from "@/lib/api";
import { MonthlyFinancialsChart, monthLabel } from "./MonthlyFinancialsChart";

function usd(n: number): string {
  return `${n < 0 ? "-" : ""}$${Math.round(Math.abs(n)).toLocaleString()}`;
}

// ISO timestamp -> "Synced Jun 22, 2:14 PM" (or null when never synced).
function syncedLabel(iso: string | null): string {
  if (!iso) return "Not yet synced";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Not yet synced";
  return `Synced ${d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

// Latest month with any GL activity, and the one before it — for the delta chip.
// Test-site GL is sparse, so trailing months are often all-zero; comparing the
// last two non-empty months reads truer than the last two calendar months.
function activeTail(months: MonthlyFinancials[]): {
  latest: MonthlyFinancials | null;
  prior: MonthlyFinancials | null;
} {
  const active = months.filter((m) => m.income !== 0 || m.operating_expense !== 0);
  return {
    latest: active[active.length - 1] ?? null,
    prior: active[active.length - 2] ?? null,
  };
}

function DeltaChip({ latest, prior }: { latest: MonthlyFinancials | null; prior: MonthlyFinancials | null }) {
  if (!latest) return null;
  const delta = prior ? latest.noi - prior.noi : null;
  const up = delta !== null && delta >= 0;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
      <span style={{ color: "var(--text-faint)", fontSize: 12 }}>Latest NOI · {monthLabel(latest.month)}</span>
      <span style={{ color: latest.noi >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700, fontSize: 18, fontVariantNumeric: "tabular-nums" }}>
        {usd(latest.noi)}
      </span>
      {delta !== null ? (
        <span style={{ color: up ? "var(--green)" : "var(--red)", fontSize: 12, fontWeight: 600 }}>
          {up ? "▲" : "▼"} {usd(Math.abs(delta))} vs {monthLabel(prior!.month)}
        </span>
      ) : null}
    </div>
  );
}

export function TrendSection({ months = 12 }: { months?: number }) {
  const [data, setData] = useState<PortfolioFinancialsTrend | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/financials/trend?months=${months}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? `HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, [months]);

  const { latest, prior } = useMemo(
    () => (data ? activeTail(data.months) : { latest: null, prior: null }),
    [data],
  );

  const hasActivity = !!data && data.months.some((m) => m.income !== 0 || m.operating_expense !== 0);

  return (
    <>
      <div className="section-head">
        <h2>Financial Trend</h2>
        <span>
          {data
            ? `Monthly · ${data.date_from} → ${data.date_to} · ${syncedLabel(data.synced_at)}`
            : `Trailing ${months} months`}
        </span>
      </div>

      {error ? (
        <div className="notice">
          <div>
            <div className="notice-title">Trend unavailable</div>
            <div className="notice-body">{error}</div>
          </div>
        </div>
      ) : !data ? (
        <div className="chart-card" style={{ textAlign: "center", color: "var(--text-faint)", padding: "40px 0" }}>
          Loading monthly ledger…
        </div>
      ) : (
        <div className="chart-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
            <div>
              <div className="chart-title">Income · Expense · NOI</div>
              <div className="chart-sub">Monthly from the general ledger</div>
            </div>
            <DeltaChip latest={latest} prior={prior} />
          </div>

          {!hasActivity ? (
            <div style={{ color: "var(--text-faint)", padding: "40px 0", textAlign: "center", fontSize: 13 }}>
              No general-ledger activity in this window.
            </div>
          ) : (
            <MonthlyFinancialsChart months={data.months} />
          )}
        </div>
      )}
    </>
  );
}
