import { fetchWorkOrders, type WorkOrders } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { Stat } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  let data: WorkOrders | null = null;
  let error: string | null = null;
  try {
    data = await fetchWorkOrders();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const s = data?.summary;

  return (
    <main className="wrap">
      <div className="page-head">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <div className="page-subtitle">Work-order board — status, priority, trade & age</div>
        </div>
        <div className="status-pill"><span className="dot" />Live · Read-only</div>
      </div>

      {error ? (
        <div className="notice"><div><div className="notice-title">Couldn’t load work orders</div><div className="notice-body">{error}</div></div></div>
      ) : !data || !s ? null : s.total === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "48px 0" }}>
          <div className="panel-title" style={{ fontSize: 16 }}>No open work orders</div>
          <div className="panel-sub" style={{ marginTop: 6 }}>Nothing in the maintenance queue for the managed portfolio.</div>
        </div>
      ) : (
        <>
          <section className="stat-grid" style={{ marginBottom: 16 }}>
            <Stat k="Open" v={String(s.open)} s={`${s.total} all-time`} accent={s.open > 0 ? "amber" : "green"} />
            <Stat k="Urgent (Open)" v={String(s.urgent_open)} accent={s.urgent_open > 0 ? "red" : "green"} />
            <Stat k="Avg Open Age" v={`${s.avg_open_age_days}d`} s={`oldest ${s.oldest_open_age_days}d`} accent="blue" />
            <Stat k="Completed" v={String(s.completed)} accent="violet" />
          </section>

          {Object.keys(s.by_trade).length > 0 ? (
            <div className="panel" style={{ marginBottom: 18 }}>
              <div className="panel-title">Open by Trade</div>
              <div className="legend" style={{ marginTop: 12 }}>
                {Object.entries(s.by_trade).map(([t, n]) => (
                  <span key={t} className="badge normal" style={{ fontSize: 12.5 }}>{t}: {n}</span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="tbl-wrap">
            <div className="tbl-scroll">
              <table className="rt">
                <thead>
                  <tr><th>WO #</th><th>Property</th><th>Unit</th><th>Type</th><th>Trade</th><th>Priority</th><th>Status</th><th>Created</th><th className="r">Age</th></tr>
                </thead>
                <tbody>
                  {data.work_orders.map((w) => (
                    <tr key={w.id}>
                      <td style={{ fontWeight: 600 }}>{w.number}</td>
                      <td className="dim">{w.property_name}</td>
                      <td className="dim">{w.unit_name ?? "—"}</td>
                      <td>{w.type}</td>
                      <td className="dim">{w.trade ?? "—"}</td>
                      <td><span className={`badge ${w.priority === "Urgent" ? "urgent" : "normal"}`}>{w.priority}</span></td>
                      <td><span className={`badge ${w.is_open ? "holdover" : "occupied"}`}>{w.status}</span></td>
                      <td className="dim">{fmtDate(w.created_on)}</td>
                      <td className="r" style={{ color: (w.age_days ?? 0) > 14 && w.is_open ? "var(--red)" : "var(--text-faint)" }}>{w.age_days != null ? `${w.age_days}d` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <footer className="foot">
        <span>Open work orders age from creation; urgent items surface to the top.</span>
        <span>MacREI</span>
      </footer>
    </main>
  );
}
