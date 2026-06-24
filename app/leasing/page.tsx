import {
  fetchAging,
  fetchLeaseExpirations,
  type DelinquencyAging,
  type LeaseExpirations,
} from "@/lib/api";
import { fmtDate, usd0 } from "@/lib/format";
import { AgingBar, Stat } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function LeasingPage() {
  let exp: LeaseExpirations | null = null;
  let aging: DelinquencyAging | null = null;
  let error: string | null = null;
  try {
    [exp, aging] = await Promise.all([fetchLeaseExpirations(180), fetchAging()]);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const upcoming = exp?.leases.filter((l) => l.days_until != null && l.days_until >= 0) ?? [];
  const holdover = exp?.leases.filter((l) => l.days_until != null && l.days_until < 0) ?? [];

  return (
    <main className="wrap">
      <div className="page-head">
        <div>
          <h1 className="page-title">Leasing & Collections</h1>
          <div className="page-subtitle">Renewal pipeline and delinquency aging</div>
        </div>
        <div className="status-pill"><span className="dot" />Live · Read-only</div>
      </div>

      {error ? (
        <div className="notice"><div><div className="notice-title">Couldn’t load leasing</div><div className="notice-body">{error}</div></div></div>
      ) : (
        <>
          {exp ? (
            <section className="stat-grid" style={{ marginBottom: 16 }}>
              <Stat k="Expiring ≤30 days" v={String(exp.expiring_30)} s="Need renewal now" accent={exp.expiring_30 > 0 ? "red" : "green"} />
              <Stat k="Expiring ≤60 days" v={String(exp.expiring_60)} accent="amber" />
              <Stat k="Expiring ≤90 days" v={String(exp.expiring_90)} accent="amber" />
              <Stat k="Month-to-Month" v={String(exp.month_to_month)} s="Incl. holdovers" accent="blue" />
              <Stat k="Holdovers" v={String(holdover.length)} s="Expired, still occupied" accent={holdover.length > 0 ? "red" : "green"} />
            </section>
          ) : null}

          {aging ? (
            <div className="panel" style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                <div><div className="panel-title">Delinquency Aging</div><div className="panel-sub">Total outstanding by age of charge</div></div>
                <div className="num" style={{ fontSize: 22, fontWeight: 700, color: "var(--red)" }}>{usd0(aging.total)}</div>
              </div>
              <AgingBar row={aging} />
              {aging.by_property.length > 0 ? (
                <div className="tbl-wrap" style={{ marginTop: 16 }}>
                  <div className="tbl-scroll">
                    <table className="rt">
                      <thead><tr><th>Property</th><th className="r">0–30</th><th className="r">31–60</th><th className="r">61–90</th><th className="r">90+</th><th className="r">Total</th></tr></thead>
                      <tbody>
                        {aging.by_property.map((p) => (
                          <tr key={p.property_id}>
                            <td style={{ fontWeight: 600 }}>{p.property_name}</td>
                            <td className="r num dim">{usd0(p.bucket_0_30)}</td>
                            <td className="r num warn-c">{usd0(p.bucket_31_60)}</td>
                            <td className="r num" style={{ color: "#fb923c" }}>{usd0(p.bucket_61_90)}</td>
                            <td className="r num neg">{usd0(p.bucket_90_plus)}</td>
                            <td className="r num" style={{ fontWeight: 700 }}>{usd0(p.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="section-head"><h2>Upcoming Expirations</h2><span>{upcoming.length} within 180 days</span></div>
          <LeaseTable rows={upcoming} mode="upcoming" />

          {holdover.length > 0 ? (
            <>
              <div className="section-head" style={{ marginTop: 22 }}><h2>Holdovers</h2><span>{holdover.length} expired, still occupied</span></div>
              <LeaseTable rows={holdover} mode="holdover" />
            </>
          ) : null}
        </>
      )}

      <footer className="foot">
        <span>Holdovers are leases past their end date with the tenant still in place — renewal-risk watch list.</span>
        <span>MacREI</span>
      </footer>
    </main>
  );
}

function LeaseTable({
  rows,
  mode,
}: {
  rows: { property_id: string; property_name: string; unit_name: string; tenant_name: string | null; lease_end: string | null; days_until: number | null; current_rent: number }[];
  mode: "upcoming" | "holdover";
}) {
  if (rows.length === 0) {
    return <div className="panel dim" style={{ fontSize: 13 }}>None.</div>;
  }
  return (
    <div className="tbl-wrap">
      <div className="tbl-scroll">
        <table className="rt">
          <thead>
            <tr><th>Property</th><th>Unit</th><th>Tenant</th><th>Lease End</th><th className="r">{mode === "upcoming" ? "Days Until" : "Days Overdue"}</th><th className="r">Rent</th></tr>
          </thead>
          <tbody>
            {rows.map((l, i) => (
              <tr key={`${l.property_id}-${l.unit_name}-${i}`}>
                <td className="dim">{l.property_name}</td>
                <td style={{ fontWeight: 600 }}>{l.unit_name}</td>
                <td className="dim">{l.tenant_name ?? "—"}</td>
                <td className="dim">{fmtDate(l.lease_end)}</td>
                <td className="r" style={{ fontWeight: 600, color: mode === "holdover" ? "var(--red)" : (l.days_until ?? 99) <= 30 ? "var(--amber)" : "var(--text)" }}>
                  {mode === "holdover" ? Math.abs(l.days_until ?? 0) : l.days_until}
                </td>
                <td className="r num">{usd0(l.current_rent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
