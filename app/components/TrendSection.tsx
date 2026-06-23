"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyFinancials, PortfolioFinancialsTrend } from "@/lib/api";

const AXIS = "#69718a";
const GRID = "rgba(255,255,255,0.06)";
const INCOME = "#34d399";
const EXPENSE = "#fbbf24";
const NOI = "#60a5fa";

function usd(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.round(Math.abs(n)).toLocaleString()}`;
}
function usdK(n: number): string {
  return `${n < 0 ? "-" : ""}$${Math.abs(Math.round(n / 1000))}k`;
}

// "2026-05" -> "May ’26"
function monthLabel(m: string): string {
  const [y, mo] = m.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const idx = Number(mo) - 1;
  const name = names[idx] ?? mo;
  return `${name} ’${y.slice(2)}`;
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

function Tip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a1e28", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ color: "#e8ebf2", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
        {typeof label === "string" ? monthLabel(label) : label}
      </div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: "#98a1b2", fontSize: 12, display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ color: "#e8ebf2", fontVariantNumeric: "tabular-nums" }}>{usd(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Latest month with any GL activity, and the one before it — for the delta chip.
// Test-site GL is sparse, so trailing months are often all-zero; comparing the
// last two non-empty months reads truer than the last two calendar months.
function activeTail(months: MonthlyFinancials[]): {
  latest: MonthlyFinancials | null;
  prior: MonthlyFinancials | null;
} {
  const active = months.filter(
    (m) => m.income !== 0 || m.operating_expense !== 0,
  );
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
      <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
        Latest NOI · {monthLabel(latest.month)}
      </span>
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
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={data.months} margin={{ left: 8, right: 16, top: 12, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis
                  dataKey="month"
                  tickFormatter={monthLabel}
                  tick={{ fill: AXIS, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={8}
                />
                <YAxis
                  tickFormatter={usdK}
                  tick={{ fill: AXIS, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<Tip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: AXIS, paddingTop: 6 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar name="Income" dataKey="income" fill={INCOME} radius={[3, 3, 0, 0]} maxBarSize={26} />
                <Bar name="Expense" dataKey="operating_expense" fill={EXPENSE} radius={[3, 3, 0, 0]} maxBarSize={26} />
                <Line name="NOI" type="monotone" dataKey="noi" stroke={NOI} strokeWidth={2.5} dot={{ r: 2.5, fill: NOI }} activeDot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </>
  );
}
