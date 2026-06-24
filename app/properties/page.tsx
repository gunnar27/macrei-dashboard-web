import Link from "next/link";
import { fetchBuildings, type BuildingStats } from "@/lib/api";

export const dynamic = "force-dynamic";

function money(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}
function occPill(rate: number): string {
  if (rate >= 95) return "good";
  if (rate >= 90) return "warn";
  return "bad";
}

export default async function PropertiesPage() {
  let buildings: BuildingStats[] = [];
  let error: string | null = null;
  try {
    buildings = await fetchBuildings();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="wrap">
      <div className="page-head">
        <div>
          <h1 className="page-title">Properties</h1>
          <div className="page-subtitle">{buildings.length} managed buildings · click any to drill in</div>
        </div>
        <div className="status-pill"><span className="dot" />Live · Read-only</div>
      </div>

      {error ? (
        <div className="notice"><div><div className="notice-title">Couldn’t load properties</div><div className="notice-body">{error}</div></div></div>
      ) : (
        <div className="table-card">
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
      )}
    </main>
  );
}
