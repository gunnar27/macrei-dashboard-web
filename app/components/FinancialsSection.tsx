"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PortfolioFinancials } from "@/lib/api";

const AXIS = "#69718a";
const GRID = "rgba(255,255,255,0.06)";

function usd(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}
function usdK(n: number): string {
  return `$${(n / 1000).toFixed(0)}k`;
}
function short(s: string): string {
  return s.length > 18 ? s.slice(0, 17) + "…" : s;
}

function Tip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a1e28", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, padding: "9px 12px" }}>
      <div style={{ color: "#e8ebf2", fontWeight: 600, fontSize: 13 }}>{label}</div>
      <div style={{ color: "#98a1b2", fontSize: 12, marginTop: 2 }}>{usd(payload[0].value)}</div>
    </div>
  );
}

export function FinancialsSection({ months = 12 }: { months?: number }) {
  const [data, setData] = useState<PortfolioFinancials | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/financials?months=${months}`)
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

  return (
    <>
      <div className="section-head">
        <h2>Financials</h2>
        <span>
          {data
            ? `Trailing ${data.window_months} mo · ${data.date_from} → ${data.date_to}`
            : `Trailing ${months} months`}
        </span>
      </div>

      {error ? (
        <div className="notice">
          <div>
            <div className="notice-title">Financials unavailable</div>
            <div className="notice-body">{error}</div>
          </div>
        </div>
      ) : !data ? (
        <div className="chart-card" style={{ textAlign: "center", color: "var(--text-faint)", padding: "40px 0" }}>
          Loading general ledger…
        </div>
      ) : (
        <>
          <section className="grid" style={{ marginBottom: 18 }}>
            <div className="card">
              <div className="label">Income</div>
              <div className="value v-green">{usd(data.total_income)}</div>
              <div className="sub">Operating income</div>
            </div>
            <div className="card">
              <div className="label">Operating Expense</div>
              <div className="value v-amber">{usd(data.total_expense)}</div>
              <div className="sub">All expense accounts</div>
            </div>
            <div className="card">
              <div className="label">Net Operating Income</div>
              <div className="value" style={{ color: data.total_noi >= 0 ? "var(--green)" : "var(--red)" }}>
                {usd(data.total_noi)}
              </div>
              <div className="sub">Income − expense</div>
            </div>
          </section>

          <section className="chart-grid">
            <div className="chart-card">
              <div className="chart-title">Expense by Category</div>
              <div className="chart-sub">Where the money goes</div>
              <ExpenseByCategory data={data} />
            </div>
            <div className="chart-card">
              <div className="chart-title">NOI by Building</div>
              <div className="chart-sub">Net operating income per property</div>
              <NoiByBuilding data={data} />
            </div>
          </section>

          <div className="table-card" style={{ marginTop: 18 }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Building</th>
                  <th>Income</th>
                  <th>Op. Expense</th>
                  <th>NOI</th>
                </tr>
              </thead>
              <tbody>
                {data.buildings.map((b) => (
                  <tr key={b.property_id}>
                    <td><span className="bldg-name">{b.name}</span></td>
                    <td className="v-green">{usd(b.income)}</td>
                    <td style={{ color: "var(--amber)" }}>{usd(b.operating_expense)}</td>
                    <td style={{ color: b.noi >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>{usd(b.noi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

function ExpenseByCategory({ data }: { data: PortfolioFinancials }) {
  const rows = Object.entries(data.expense_by_category)
    .map(([name, value]) => ({ name, value }))
    .slice(0, 10);
  if (rows.length === 0)
    return <div style={{ color: "var(--text-faint)", padding: "30px 0", fontSize: 13 }}>No expense data in window.</div>;
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, rows.length * 32)}>
      <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis type="number" tick={{ fill: AXIS, fontSize: 11 }} tickFormatter={usdK} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={130} tick={{ fill: AXIS, fontSize: 11 }} tickFormatter={short} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<Tip />} />
        <Bar dataKey="value" radius={[0, 5, 5, 0]} barSize={15} fill="#fbbf24" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function NoiByBuilding({ data }: { data: PortfolioFinancials }) {
  const rows = [...data.buildings].sort((a, b) => b.noi - a.noi);
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, rows.length * 32)}>
      <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis type="number" tick={{ fill: AXIS, fontSize: 11 }} tickFormatter={usdK} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={130} tick={{ fill: AXIS, fontSize: 11 }} tickFormatter={short} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<Tip />} />
        <Bar dataKey="noi" radius={[0, 5, 5, 0]} barSize={15}>
          {rows.map((b) => (
            <Cell key={b.property_id} fill={b.noi >= 0 ? "#34d399" : "#f87171"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
