import { fetchPortfolioSummary, type PortfolioSummary } from "@/lib/api";

export const dynamic = "force-dynamic";

// ── helpers ────────────────────────────────────────────────
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

// ── icons (inline, no deps) ────────────────────────────────
const I = {
  building: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M19 21V11a1 1 0 0 0-1-1h-3" /><path d="M8 7h2M8 11h2M8 15h2" /></svg>
  ),
  key: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.5 12.5 8-8M16 6l3 3M19 3l2 2" /></svg>
  ),
  door: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M4 21h16M14 12h.01" /></svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" /></svg>
  ),
  wrench: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z" /></svg>
  ),
  cash: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></svg>
  ),
  alert: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>
  ),
  logo: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-6h6v6" /></svg>
  ),
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
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 70 70)"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="ring-center">
        <div className="ring-pct" style={{ color }}>{rate}%</div>
        <div className="ring-label">Occupied</div>
      </div>
    </div>
  );
}

function Card({
  icon,
  chip,
  label,
  value,
  sub,
  tag,
  valueClass = "",
  pending = false,
}: {
  icon: React.ReactNode;
  chip: string;
  label: string;
  value: string;
  sub?: string;
  tag?: { text: string; cls: string };
  valueClass?: string;
  pending?: boolean;
}) {
  return (
    <div className={`card${pending ? " pending" : ""}`}>
      <div className={`chip ${chip}`}>{icon}</div>
      <div className="label">{label}</div>
      <div className={`value ${valueClass}`}>{value}</div>
      {sub ? <div className="sub">{sub}</div> : null}
      {tag ? <span className={`tag ${tag.cls}`}>{tag.text}</span> : null}
    </div>
  );
}

export default async function Home() {
  let data: PortfolioSummary | null = null;
  let error: string | null = null;
  try {
    data = await fetchPortfolioSummary();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const now = new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <main className="wrap">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">{I.logo}</div>
          <div>
            <div className="brand-name">MacREI Properties</div>
            <div className="brand-sub">Portfolio Overview</div>
          </div>
        </div>
        <div className="status-pill">
          <span className="dot" />
          Live · Read-only
        </div>
      </div>

      {error ? (
        <div className="notice">
          <div className="chip red">{I.alert}</div>
          <div>
            <div className="notice-title">Couldn’t load portfolio data</div>
            <div className="notice-body">
              {error}
              <br />
              Check that the read-API is running and{" "}
              <code>NEXT_PUBLIC_API_BASE_URL</code> points at it.
            </div>
          </div>
        </div>
      ) : data ? (
        <>
          <section className="hero">
            <div className="hero-card">
              <Ring rate={data.occupancy_rate} />
              <div className="hero-meta">
                <div className="hero-title">Occupancy</div>
                <div className="hero-big">
                  {data.occupied_units}
                  <span style={{ color: "var(--text-faint)", fontWeight: 600 }}>
                    /{data.total_units}
                  </span>
                </div>
                <div className="hero-note">
                  {data.vacant_units === 0
                    ? "Fully leased"
                    : `${data.vacant_units} unit${data.vacant_units === 1 ? "" : "s"} vacant`}
                </div>
              </div>
            </div>

            <div className="hero-side">
              <div className="hero-card mini">
                <div className="mini-label">Gross Monthly Rent</div>
                <div
                  className="mini-value"
                  style={{ color: data.gross_monthly_rent === null ? "var(--text-faint)" : "var(--green)" }}
                >
                  {money(data.gross_monthly_rent)}
                </div>
                <div className="mini-sub">
                  {data.gross_monthly_rent === null ? "Pending charge sync" : "Across occupied units"}
                </div>
              </div>
              <div className="hero-card mini">
                <div className="mini-label">Total Past Due</div>
                <div
                  className="mini-value"
                  style={{ color: data.total_past_due === null ? "var(--text-faint)" : "var(--red)" }}
                >
                  {money(data.total_past_due)}
                </div>
                <div className="mini-sub">
                  {data.total_past_due === null ? "Pending charge sync" : "Outstanding balances"}
                </div>
              </div>
            </div>
          </section>

          <div className="section-head">
            <h2>Portfolio Metrics</h2>
            <span>Updated {now}</span>
          </div>

          <section className="grid">
            <Card icon={I.building} chip="blue" label="Total Units" value={String(data.total_units)} sub="Across the portfolio" />
            <Card
              icon={I.door}
              chip={data.vacant_units > 0 ? "amber" : "green"}
              label="Vacant Units"
              value={String(data.vacant_units)}
              valueClass={data.vacant_units > 0 ? "v-amber" : "v-green"}
              sub={data.vacant_units > 0 ? "Needs leasing attention" : "All units leased"}
            />
            <Card icon={I.users} chip="violet" label="Active Tenants" value={String(data.active_tenants)} sub="Current residents" />
            <Card
              icon={I.wrench}
              chip={data.urgent_work_orders > 0 ? "red" : "blue"}
              label="Open Work Orders"
              value={String(data.open_work_orders)}
              valueClass={data.urgent_work_orders > 0 ? "v-amber" : ""}
              tag={data.urgent_work_orders > 0 ? { text: `${data.urgent_work_orders} urgent`, cls: "warn" } : undefined}
              sub={data.urgent_work_orders === 0 ? "Nothing urgent" : undefined}
            />
            <Card
              icon={I.cash}
              chip="green"
              label="Gross Monthly Rent"
              value={money(data.gross_monthly_rent)}
              valueClass={data.gross_monthly_rent === null ? "v-faint" : "v-green"}
              tag={data.gross_monthly_rent === null ? { text: "pending data", cls: "muted" } : undefined}
              pending={data.gross_monthly_rent === null}
            />
            <Card
              icon={I.alert}
              chip="red"
              label="Total Past Due"
              value={money(data.total_past_due)}
              valueClass={data.total_past_due === null ? "v-faint" : "v-red"}
              tag={data.total_past_due === null ? { text: "pending data", cls: "muted" } : undefined}
              pending={data.total_past_due === null}
            />
          </section>
        </>
      ) : null}

      <footer className="foot">
        <span>Read-only — no write reaches AppFolio until the owner lifts the kill-switch.</span>
        <span>MacREI · Los Angeles County</span>
      </footer>
    </main>
  );
}
