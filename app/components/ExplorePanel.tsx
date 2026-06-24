"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GlQuery } from "@/lib/api";
import { monthLabel } from "./MonthlyFinancialsChart";

const AXIS = "#69718a";
const GRID = "rgba(255,255,255,0.06)";
const KIND_COLOR: Record<string, string> = { income: "#34d399", expense: "#fbbf24", noi: "#60a5fa" };

function usd(n: number): string {
  return `${n < 0 ? "-" : ""}$${Math.round(Math.abs(n)).toLocaleString()}`;
}
function usdK(n: number): string {
  return `${n < 0 ? "-" : ""}$${Math.abs(Math.round(n / 1000))}k`;
}

const KINDS = [
  { key: "expense", label: "Expense" },
  { key: "income", label: "Income" },
  { key: "noi", label: "NOI" },
];
const WINDOWS = [
  { key: 3, label: "3 mo" },
  { key: 6, label: "6 mo" },
  { key: 12, label: "12 mo" },
  { key: 24, label: "24 mo" },
];

function Tip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a1e28", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, padding: "9px 12px" }}>
      <div style={{ color: "#e8ebf2", fontWeight: 600, fontSize: 13 }}>{typeof label === "string" ? monthLabel(label) : label}</div>
      <div style={{ color: "#98a1b2", fontSize: 12, marginTop: 2 }}>{usd(payload[0].value)}</div>
    </div>
  );
}

type Building = { property_id: string; name: string };

export function ExplorePanel({ buildings, categories }: { buildings: Building[]; categories: string[] }) {
  const [kind, setKind] = useState("expense");
  const [propertyId, setPropertyId] = useState("");
  const [category, setCategory] = useState("");
  const [months, setMonths] = useState(12);
  const [data, setData] = useState<GlQuery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const q = new URLSearchParams({ kind, months: String(months) });
    if (propertyId) q.set("property_id", propertyId);
    if (category) q.set("category", category);
    fetch(`/api/query?${q.toString()}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? `HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { if (alive) { setData(d); setError(null); } })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [kind, propertyId, category, months]);

  const propName = buildings.find((b) => b.property_id === propertyId)?.name ?? "the whole portfolio";
  const kindLabel = KINDS.find((k) => k.key === kind)?.label ?? kind;
  const sentence = `${category || kindLabel} · ${propName} · last ${months} months`;
  const color = KIND_COLOR[kind] ?? "#60a5fa";
  const cats = data ? Object.entries(data.by_category) : [];

  return (
    <>
      <div className="controls">
        <div className="ctrl">
          <span className="ctrl-label">Measure</span>
          <div className="seg">
            {KINDS.map((k) => (
              <button key={k.key} className={kind === k.key ? "on" : ""} onClick={() => { setKind(k.key); setCategory(""); }}>
                {k.label}
              </button>
            ))}
          </div>
        </div>
        <div className="ctrl">
          <span className="ctrl-label">Property</span>
          <select className="ctrl-input" value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
            <option value="">All properties</option>
            {buildings.map((b) => (
              <option key={b.property_id} value={b.property_id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="ctrl">
          <span className="ctrl-label">Category</span>
          <select className="ctrl-input" value={category} onChange={(e) => setCategory(e.target.value)} disabled={kind === "noi"}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="ctrl">
          <span className="ctrl-label">Window</span>
          <div className="seg">
            {WINDOWS.map((w) => (
              <button key={w.key} className={months === w.key ? "on" : ""} onClick={() => setMonths(w.key)}>
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="notice"><div><div className="notice-title">Query failed</div><div className="notice-body">{error}</div></div></div>
      ) : (
        <div className="chart-card">
          <div className="big-answer">
            <span className="num" style={{ color }}>{data ? usd(data.total) : "—"}</span>
            <span className="ctx">{sentence}{loading ? " · …" : ""}</span>
          </div>
          {data && data.monthly.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthly} margin={{ left: 8, right: 16, top: 14, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={8} />
                <YAxis tickFormatter={usdK} tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<Tip />} />
                <Bar dataKey="amount" fill={color} radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      )}

      {!category && cats.length > 0 ? (
        <div className="table-card" style={{ marginTop: 18 }}>
          <table className="data">
            <thead><tr><th>{kind === "income" ? "Income account" : "Category"}</th><th>Total</th></tr></thead>
            <tbody>
              {cats.map(([name, amt]) => (
                <tr key={name} style={{ cursor: "pointer" }} onClick={() => setCategory(name)}>
                  <td><span className="bldg-name">{name}</span></td>
                  <td style={{ color }}>{usd(amt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
