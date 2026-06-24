import { fetchRentRoll, type RentRoll } from "@/lib/api";
import { fmtDate, pct, usd0 } from "@/lib/format";
import { BridgeRow, Stat, StatusBadge } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function RentRollPage() {
  let data: RentRoll | null = null;
  let error: string | null = null;
  try {
    data = await fetchRentRoll();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const s = data?.summary;

  return (
    <main className="wrap">
      <div className="page-head">
        <div>
          <h1 className="page-title">Rent Roll</h1>
          <div className="page-subtitle">
            {data ? `${s!.total_units} units · as of ${fmtDate(data.as_of)}` : "Unit-level rent roll"}
          </div>
        </div>
        <div className="status-pill"><span className="dot" />Live · Read-only</div>
      </div>

      {error ? (
        <div className="notice"><div><div className="notice-title">Couldn’t load rent roll</div><div className="notice-body">{error}</div></div></div>
      ) : !data || !s ? null : (
        <>
          <section className="stat-grid" style={{ marginBottom: 16 }}>
            <Stat k="Occupancy" v={pct(s.occupancy_rate)} s={`${s.occupied_units} of ${s.revenue_units} units`} accent={s.occupancy_rate >= 95 ? "green" : s.occupancy_rate >= 90 ? "amber" : "red"} />
            <Stat k="Gross Potential Rent" v={usd0(s.gross_potential_rent)} s="At market, monthly" accent="violet" />
            <Stat k="In-Place Rent" v={usd0(s.in_place_rent)} s="Occupied units" accent="green" />
            <Stat k="Loss to Lease" v={usd0(s.loss_to_lease)} s="Market − in-place (net)" accent="amber" />
            <Stat k="Vacancy Loss" v={usd0(s.vacancy_loss)} s={`${s.vacant_units} vacant units`} accent="red" />
            <Stat k="Month-to-Month" v={String(s.month_to_month)} s={`${s.expiring_90} expiring ≤90d`} accent="blue" />
          </section>

          <div className="panel" style={{ marginBottom: 18 }}>
            <div className="panel-title">Rent Bridge</div>
            <div className="panel-sub">From gross potential to in-place rent</div>
            <div className="bridge">
              <BridgeRow label="Gross Potential Rent" amount={usd0(s.gross_potential_rent)} pctOf={1} color="var(--violet)" />
              <BridgeRow label="Less: Vacancy Loss" amount={`(${usd0(s.vacancy_loss)})`} pctOf={s.vacancy_loss / (s.gross_potential_rent || 1)} color="var(--red)" />
              <BridgeRow label="Less: Loss to Lease" amount={`(${usd0(s.loss_to_lease)})`} pctOf={Math.abs(s.loss_to_lease) / (s.gross_potential_rent || 1)} color="var(--amber)" />
              <BridgeRow label="In-Place Rent" amount={usd0(s.in_place_rent)} pctOf={s.in_place_rent / (s.gross_potential_rent || 1)} color="var(--green)" total />
            </div>
          </div>

          <div className="tbl-wrap">
            <div className="tbl-scroll">
              <table className="rt">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Property</th>
                    <th>Bd/Ba</th>
                    <th className="r">SqFt</th>
                    <th className="r">Market</th>
                    <th className="r">In-Place</th>
                    <th className="r">Δ to Market</th>
                    <th>Status</th>
                    <th>Tenant</th>
                    <th>Lease End</th>
                    <th className="r">Days Vac.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.units.map((u) => {
                    const delta = u.status === "Occupied" ? u.actual_rent - u.market_rent : 0;
                    return (
                      <tr key={u.unit_id}>
                        <td style={{ fontWeight: 600 }}>{u.unit_name}</td>
                        <td className="dim">{u.property_name}</td>
                        <td className="dim">{u.bedrooms != null ? `${u.bedrooms}/${u.bathrooms ?? "—"}` : "—"}</td>
                        <td className="r dim">{u.square_feet ? u.square_feet.toLocaleString() : "—"}</td>
                        <td className="r num">{usd0(u.market_rent)}</td>
                        <td className="r num">{u.status === "Occupied" ? usd0(u.actual_rent) : "—"}</td>
                        <td className={`r num ${delta < 0 ? "neg" : delta > 0 ? "pos" : "dim"}`}>
                          {u.status === "Occupied" ? usd0(delta) : "—"}
                        </td>
                        <td><StatusBadge status={u.status} />{u.is_mtm ? <span className="badge mtm" style={{ marginLeft: 6 }}>MTM</span> : null}</td>
                        <td className="dim">{u.tenant_name ?? "—"}</td>
                        <td className="dim">{fmtDate(u.lease_end)}</td>
                        <td className="r" style={{ color: (u.days_vacant ?? 0) > 60 ? "var(--red)" : "var(--text-faint)" }}>
                          {u.days_vacant ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <footer className="foot">
        <span>GPR at market · in-place from current leases · loss-to-lease is net of above/below-market units.</span>
        <span>MacREI</span>
      </footer>
    </main>
  );
}
