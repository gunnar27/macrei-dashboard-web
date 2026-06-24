"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AskResult } from "@/lib/api";
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

const SAMPLES = [
  "What's my trash bill across the portfolio this year?",
  "How much did I spend on flooring at Walnut?",
  "What's my NOI for the whole portfolio?",
];

export function AskBox() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<AskResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(question: string) {
    const text = question.trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/ask?q=${encodeURIComponent(text)}`);
      if (!r.ok) throw new Error((await r.json()).error ?? `HTTP ${r.status}`);
      setData(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const color = data ? KIND_COLOR[data.kind] ?? "#60a5fa" : "#60a5fa";

  return (
    <div className="panel" style={{ marginBottom: 18 }}>
      <div className="panel-title">Ask the ledger</div>
      <div className="panel-sub">Plain English — Claude maps it to the books and answers from the data.</div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
        style={{ display: "flex", gap: 10, marginTop: 4 }}
      >
        <input
          className="ctrl-input"
          style={{ flex: 1, minWidth: 0 }}
          placeholder="e.g. what did I spend on water at Dickens this year?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="ask-btn" disabled={loading}>
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {SAMPLES.map((s) => (
          <button key={s} type="button" className="chip-btn" onClick={() => { setQ(s); run(s); }}>
            {s}
          </button>
        ))}
      </div>

      {error ? (
        <div className="notice" style={{ marginTop: 14 }}>
          <div><div className="notice-title">Couldn’t answer</div><div className="notice-body">{error}</div></div>
        </div>
      ) : data ? (
        <div style={{ marginTop: 16 }}>
          <div className="big-answer">
            <span className="num" style={{ color }}>{usd(data.query.total)}</span>
            <span className="ctx">{data.answer}</span>
          </div>
          <div className="panel-sub" style={{ marginTop: 2 }}>
            Interpreted as: {data.kind}{data.category ? ` · ${data.category}` : ""}{data.property_name ? ` · ${data.property_name}` : " · whole portfolio"} · {data.months} mo
          </div>
          {data.query.monthly.some((m) => m.amount !== 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.query.monthly} margin={{ left: 8, right: 16, top: 14, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={8} />
                <YAxis tickFormatter={usdK} tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#1a1e28", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10 }} formatter={(v) => usd(Number(v))} labelFormatter={(l) => monthLabel(String(l))} />
                <Bar dataKey="amount" fill={color} radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
