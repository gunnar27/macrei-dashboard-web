import { usd0 } from "@/lib/format";

// KPI stat tile with an accent bar.
export function Stat({
  k,
  v,
  s,
  accent = "blue",
}: {
  k: string;
  v: string;
  s?: string;
  accent?: "green" | "amber" | "red" | "blue" | "violet";
}) {
  return (
    <div className={`stat ${accent}`}>
      <div className="k">{k}</div>
      <div className="v num">{v}</div>
      {s ? <div className="s">{s}</div> : null}
    </div>
  );
}

const STATUS_CLASS: Record<string, string> = {
  Occupied: "occupied",
  Vacant: "vacant",
  "Non-revenue": "nonrev",
};
export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${STATUS_CLASS[status] ?? "normal"}`}>{status}</span>;
}

// Stacked delinquency-aging bar with legend.
const AGING = [
  { key: "bucket_0_30", label: "0–30", color: "#34d399" },
  { key: "bucket_31_60", label: "31–60", color: "#fbbf24" },
  { key: "bucket_61_90", label: "61–90", color: "#fb923c" },
  { key: "bucket_90_plus", label: "90+", color: "#f87171" },
];
type AgingRow = { bucket_0_30: number; bucket_31_60: number; bucket_61_90: number; bucket_90_plus: number };
export function AgingBar({ row, showLegend = true }: { row: AgingRow; showLegend?: boolean }) {
  const get = (k: string) => (row as unknown as Record<string, number>)[k] || 0;
  const total = AGING.reduce((a, b) => a + get(b.key), 0) || 1;
  return (
    <div>
      <div className="bar-stack">
        {AGING.map((b) => {
          const w = ((get(b.key) || 0) / total) * 100;
          return w > 0 ? <span key={b.key} style={{ width: `${w}%`, background: b.color }} /> : null;
        })}
      </div>
      {showLegend ? (
        <div className="legend">
          {AGING.map((b) => (
            <span key={b.key}>
              <i style={{ background: b.color }} />
              {b.label}: {usd0(get(b.key) || 0)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// A single line of a financial bridge / waterfall.
export function BridgeRow({
  label,
  amount,
  pctOf,
  color = "var(--text)",
  total = false,
  icon,
}: {
  label: string;
  amount: string;
  pctOf?: number; // 0..1 bar fill
  color?: string;
  total?: boolean;
  icon?: string;
}) {
  return (
    <div className={`bridge-row${total ? " total" : ""}`}>
      <span className="lbl">
        {icon ? <span style={{ color }}>{icon}</span> : null}
        {label}
      </span>
      {pctOf != null ? (
        <span className="bartrack">
          <span style={{ width: `${Math.max(0, Math.min(100, pctOf * 100))}%`, background: color }} />
        </span>
      ) : null}
      <span className="amt" style={{ color }}>
        {amount}
      </span>
    </div>
  );
}
