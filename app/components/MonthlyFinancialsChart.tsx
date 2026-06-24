"use client";

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
import type { MonthlyFinancials } from "@/lib/api";

const AXIS = "#69718a";
const GRID = "rgba(255,255,255,0.06)";
const INCOME = "#34d399";
const EXPENSE = "#fbbf24";
const NOI = "#60a5fa";

function usd(n: number): string {
  return `${n < 0 ? "-" : ""}$${Math.round(Math.abs(n)).toLocaleString()}`;
}
function usdK(n: number): string {
  return `${n < 0 ? "-" : ""}$${Math.abs(Math.round(n / 1000))}k`;
}

// "2026-05" -> "May ’26"
export function monthLabel(m: string): string {
  const [y, mo] = m.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[Number(mo) - 1] ?? mo} ’${y.slice(2)}`;
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

// Income + Expense bars with an NOI line, over monthly buckets. Shared by the
// portfolio trend section and the per-building drill-down.
export function MonthlyFinancialsChart({ months, height = 320 }: { months: MonthlyFinancials[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={months} margin={{ left: 8, right: 16, top: 12, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={8} />
        <YAxis tickFormatter={usdK} tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<Tip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: AXIS, paddingTop: 6 }} iconType="circle" iconSize={8} />
        <Bar name="Income" dataKey="income" fill={INCOME} radius={[3, 3, 0, 0]} maxBarSize={26} />
        <Bar name="Expense" dataKey="operating_expense" fill={EXPENSE} radius={[3, 3, 0, 0]} maxBarSize={26} />
        <Line name="NOI" type="monotone" dataKey="noi" stroke={NOI} strokeWidth={2.5} dot={{ r: 2.5, fill: NOI }} activeDot={{ r: 4 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
