import { fetchPortfolioSummary, type PortfolioSummary } from "@/lib/api";

// Server component — fetches on the server each request (no stale cache). The
// API base must be reachable from the deployment (Railway/Fly URL in prod).
export const dynamic = "force-dynamic";

function money(n: number | null): string {
  return n === null ? "—" : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function occupancyClass(rate: number): string {
  if (rate >= 95) return "good";
  if (rate >= 90) return "warn";
  return "bad";
}

function Card({
  label,
  value,
  sub,
  cls = "",
}: {
  label: string;
  value: string;
  sub?: string;
  cls?: string;
}) {
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className={`value ${cls}`}>{value}</div>
      {sub ? <div className="sub">{sub}</div> : null}
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

  return (
    <main className="wrap">
      <header>
        <h1>MacREI Portfolio</h1>
        <p>Portfolio overview · live read-only from AppFolio</p>
      </header>

      {error ? (
        <div className="error">
          Could not load portfolio data: {error}
          <br />
          Is the read-API running and NEXT_PUBLIC_API_BASE_URL set?
        </div>
      ) : data ? (
        <div className="grid">
          <Card
            label="Occupancy"
            value={`${data.occupancy_rate}%`}
            sub={`${data.occupied_units}/${data.total_units} units`}
            cls={occupancyClass(data.occupancy_rate)}
          />
          <Card label="Total Units" value={String(data.total_units)} />
          <Card
            label="Vacant Units"
            value={String(data.vacant_units)}
            cls={data.vacant_units > 0 ? "warn" : "good"}
          />
          <Card label="Active Tenants" value={String(data.active_tenants)} />
          <Card
            label="Open Work Orders"
            value={String(data.open_work_orders)}
            sub={`${data.urgent_work_orders} urgent`}
            cls={data.urgent_work_orders > 0 ? "warn" : ""}
          />
          <Card
            label="Gross Monthly Rent"
            value={money(data.gross_monthly_rent)}
            sub={data.gross_monthly_rent === null ? "pending charge reads" : undefined}
            cls={data.gross_monthly_rent === null ? "pending" : "good"}
          />
          <Card
            label="Total Past Due"
            value={money(data.total_past_due)}
            sub={data.total_past_due === null ? "pending charge reads" : undefined}
            cls={data.total_past_due === null ? "pending" : "bad"}
          />
        </div>
      ) : null}

      <p className="foot">
        Data is read-only. No write reaches AppFolio until the kill-switch is
        lifted by the owner.
      </p>
    </main>
  );
}
