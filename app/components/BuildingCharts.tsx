"use client";

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
import type { BuildingStats } from "@/lib/api";

const AXIS = "#69718a";
const GRID = "rgba(255,255,255,0.06)";

function occColor(rate: number): string {
  if (rate >= 95) return "#34d399";
  if (rate >= 90) return "#fbbf24";
  return "#f87171";
}

function shortName(name: string): string {
  return name.length > 16 ? name.slice(0, 15) + "…" : name;
}

function TipBox({
  active,
  payload,
  suffix = "",
  prefix = "",
}: {
  active?: boolean;
  payload?: Array<{ payload: BuildingStats; value: number }>;
  suffix?: string;
  prefix?: string;
}) {
  if (!active || !payload?.length) return null;
  const b = payload[0].payload;
  const v = payload[0].value;
  return (
    <div
      style={{
        background: "#1a1e28",
        border: "1px solid rgba(255,255,255,0.13)",
        borderRadius: 10,
        padding: "10px 13px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ color: "#e8ebf2", fontWeight: 600, fontSize: 13 }}>{b.name}</div>
      <div style={{ color: "#98a1b2", fontSize: 12, marginTop: 2 }}>
        {prefix}
        {v.toLocaleString()}
        {suffix}
      </div>
    </div>
  );
}

export function OccupancyByBuilding({ data }: { data: BuildingStats[] }) {
  const rows = [...data].sort((a, b) => a.occupancy_rate - b.occupancy_rate);
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, rows.length * 34)}>
      <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fill: AXIS, fontSize: 11 }}
          tickFormatter={(v) => `${v}%`}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fill: AXIS, fontSize: 11 }}
          tickFormatter={shortName}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<TipBox suffix="% occupied" />} />
        <Bar dataKey="occupancy_rate" radius={[0, 5, 5, 0]} barSize={16}>
          {rows.map((b) => (
            <Cell key={b.property_id} fill={occColor(b.occupancy_rate)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RentByBuilding({ data }: { data: BuildingStats[] }) {
  const rows = [...data]
    .filter((b) => b.gross_monthly_rent > 0)
    .sort((a, b) => b.gross_monthly_rent - a.gross_monthly_rent);
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, rows.length * 34)}>
      <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis
          type="number"
          tick={{ fill: AXIS, fontSize: 11 }}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fill: AXIS, fontSize: 11 }}
          tickFormatter={shortName}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<TipBox prefix="$" suffix="/mo" />} />
        <Bar dataKey="gross_monthly_rent" radius={[0, 5, 5, 0]} barSize={16} fill="#60a5fa" />
      </BarChart>
    </ResponsiveContainer>
  );
}
