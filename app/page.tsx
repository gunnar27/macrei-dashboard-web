import {
  fetchBuildings,
  fetchPortfolioSummary,
  type BuildingStats,
  type PortfolioSummary,
} from "@/lib/api";
import Link from "next/link";
import { OccupancyByBuilding, RentByBuilding } from "./components/BuildingCharts";
import { FinancialsSection } from "./components/FinancialsSection";
import { TrendSection } from "./components/TrendSection";

export const dynamic = "force-dynamic";

function money(n: number | null): string {
  return n === null
    ? "—"
    : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function occColor(rate: number): string {
  if (rate >= 95) return "var(--green)";
  if (rate >= 90) return "var(--amber)";
  return "var(--red)";
}
function occPill(rate: number): string {
  if (rate >= 95) return "good";
  if (rate >= 90) return "warn";
  return "bad";
}

const I = {
  building: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M19 21V11a1 1 0 0 0-1-1h-3"/><path d="M8 7h2M8 11h2M8 15h2"/></svg>),
  door: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M4 21h16M14 12h.01"/></svg>),
  users: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>),
  wrench: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z"/></svg>),
  cash: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>),
  alert: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>),
  logo: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V9l9-6 9 6v12"/><path d="M9 21v-6h6v6"/></svg>),
};

function Ring({ rate }: { rate: number }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, rate)) / 100) * c;
  const color = occColor(rate);
  return (
    <div className="ring-wrap" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`} transform="rotate(-90 70 70)"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }} />
      </svg>
      <div className="ring-center">
        <div className="ring-pct" style={{ color }}>{rate}%</div>
        <div className="ring-label">Occupied</div>
      </div>
    </div>
  );
}

function Card({ icon, chip, label, value, sub, tag, valueClass = "" }: {
  icon: React.ReactNode; chip: string; label: string; value: string;
  sub?: string; tag?: { text: string; cls: string }; valueClass?: string;
}) {
  return (
    <div className="card">
      <div className={`chip ${chip}`}>{icon}</div>
      <div className="label">{label}</div>
      <div className={`value ${valueClass}`}>{value}</div>
      {sub ? <div className="sub">{sub}</div> : null}
      {tag ? <span className={`tag ${tag.cls}`}>{tag.text}</span> : null}
    </div>
  );
}

export default async function Home() {
  let summary: PortfolioSummary | null = null;
  let buildings: BuildingStats[] = [];
  let error: string | null = null;
  try {
    [summary, buildings] = await Promise.all([fetchPortfolioSummary(), fetchBuildings()]);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const now = new Date().toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });

  return (
    <main className="wrap">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">{I.logo}</div>
          <div>
            <div className="brand-name">MacREI Properties</div>
            <div className="brand-sub">Portfolio Analytics</div>
          </div>
        </div>
        <div className="status-pill"><span className="dot" />Live · Read-only</div>
      </div>

      {error ? (
        <div className="notice">
          <div className="chip red">{I.alert}</div>
          <div>
            <div className="notice-title">Couldn’t load portfolio data</div>
            <div className="notice-body">{error}</div>
          </div>
        </div>
      ) : summary ? (
        <>
          <section className="hero">
            <div className="hero-card">
              <Ring rate={summary.occupancy_rate} />
              <div className="hero-meta">
                <div className="hero-title">Occupancy</div>
                <div className="hero-big">
                  {summary.occupied_units}
                  <span style={{ color: "var(--text-faint)", fontWeight: 600 }}>/{summary.total_units}</span>
                </div>
                <div className="hero-note">
                  {summary.vacant_units === 0 ? "Fully leased" : `${summary.vacant_units} vacant`}
                </div>
              </div>
            </div>
            <div className="hero-side">
              <div className="hero-card mini">
                <div className="mini-label">Gross Monthly Rent</div>
                <div className="mini-value" style={{ color: "var(--green)" }}>{money(summary.gross_monthly_rent)}</div>
                <div className="mini-sub">Across occupied units</div>
              </div>
              <div className="hero-card mini">
                <div className="mini-label">Total Past Due</div>
                <div className="mini-value" style={{ color: "var(--red)" }}>{money(summary.total_past_due)}</div>
                <div className="mini-sub">Outstanding balances</div>
              </div>
            </div>
          </section>

          <div className="section-head">
            <h2>Portfolio Metrics</h2>
            <span>Updated {now}</span>
          </div>
          <section className="grid">
            <Card icon={I.building} chip="blue" label="Total Units" value={String(summary.total_units)} sub="Across the portfolio" />
            <Card icon={I.door} chip={summary.vacant_units > 0 ? "amber" : "green"} label="Vacant Units"
              value={String(summary.vacant_units)} valueClass={summary.vacant_units > 0 ? "v-amber" : "v-green"}
              sub={summary.vacant_units > 0 ? "Needs leasing attention" : "All leased"} />
            <Card icon={I.users} chip="violet" label="Active Tenants" value={String(summary.active_tenants)} sub="Current residents" />
            <Card icon={I.wrench} chip={summary.urgent_work_orders > 0 ? "red" : "blue"} label="Open Work Orders"
              value={String(summary.open_work_orders)} valueClass={summary.urgent_work_orders > 0 ? "v-amber" : ""}
              tag={summary.urgent_work_orders > 0 ? { text: `${summary.urgent_work_orders} urgent`, cls: "warn" } : undefined}
              sub={summary.urgent_work_orders === 0 ? "Nothing urgent" : undefined} />
            <Card icon={I.cash} chip="green" label="Gross Monthly Rent" value={money(summary.gross_monthly_rent)} valueClass="v-green" sub="Occupied units" />
            <Card icon={I.alert} chip="red" label="Total Past Due" value={money(summary.total_past_due)} valueClass="v-red" sub="Outstanding" />
          </section>

          {buildings.length > 0 ? (
            <>
              <div className="section-head">
                <h2>By Building</h2>
                <span>{buildings.length} properties</span>
              </div>

              <section className="chart-grid">
                <div className="chart-card">
                  <div className="chart-title">Occupancy by Building</div>
                  <div className="chart-sub">Sorted lowest first — leasing priorities</div>
                  <OccupancyByBuilding data={buildings} />
                </div>
                <div className="chart-card">
                  <div className="chart-title">Monthly Rent by Building</div>
                  <div className="chart-sub">Gross rent across occupied units</div>
                  <RentByBuilding data={buildings} />
                </div>
              </section>

              <div className="table-card" style={{ marginTop: 18 }}>
                <table className="data">
                  <thead>
                    <tr>
                      <th>Building</th>
                      <th>Units</th>
                      <th>Occupancy</th>
                      <th>Vacant</th>
                      <th>Tenants</th>
                      <th>Open WOs</th>
                      <th>Monthly Rent</th>
                      <th>Past Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buildings.map((b) => (
                      <tr key={b.property_id}>
                        <td>
                          <Link href={`/buildings/${b.property_id}`} className="bldg-link">
                            <div className="bldg-name">{b.name}</div>
                            {b.address ? <div className="bldg-addr">{b.address}</div> : null}
                          </Link>
                        </td>
                        <td>{b.units}</td>
                        <td><span className={`pill ${occPill(b.occupancy_rate)}`}>{b.occupancy_rate}%</span></td>
                        <td style={{ color: b.vacant_units > 0 ? "var(--amber)" : "var(--text-faint)" }}>{b.vacant_units}</td>
                        <td>{b.active_tenants}</td>
                        <td style={{ color: b.open_work_orders > 0 ? "var(--text)" : "var(--text-faint)" }}>{b.open_work_orders}</td>
                        <td>{money(b.gross_monthly_rent)}</td>
                        <td style={{ color: b.total_past_due > 0 ? "var(--red)" : "var(--text-faint)" }}>{money(b.total_past_due)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          <TrendSection months={12} />

          <FinancialsSection months={12} />
        </>
      ) : null}

      <footer className="foot">
        <span>Read-only — no write reaches AppFolio until the owner lifts the kill-switch.</span>
        <span>MacREI · Los Angeles County</span>
      </footer>
    </main>
  );
}
