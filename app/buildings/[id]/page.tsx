import Link from "next/link";
import { fetchBuildingFinancials, type BuildingFinancialsDetail } from "@/lib/api";
import { MonthlyFinancialsChart } from "../../components/MonthlyFinancialsChart";

export const dynamic = "force-dynamic";

function money(n: number): string {
  return `${n < 0 ? "-" : ""}$${Math.abs(Math.round(n)).toLocaleString()}`;
}

function syncedLabel(iso: string | null): string {
  if (!iso) return "Not yet synced";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Not yet synced";
  return `Synced ${d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

const backIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default async function BuildingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let data: BuildingFinancialsDetail | null = null;
  let error: string | null = null;
  try {
    data = await fetchBuildingFinancials(id, 12);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const hasActivity = !!data && data.months.some((m) => m.income !== 0 || m.operating_expense !== 0);
  const cats = data ? Object.entries(data.expense_by_category) : [];

  return (
    <main className="wrap">
      <div className="topbar">
        <Link href="/" className="status-pill" style={{ textDecoration: "none", gap: 8 }}>
          {backIcon} Portfolio
        </Link>
        <div className="status-pill"><span className="dot" />Live · Read-only</div>
      </div>

      {error ? (
        <div className="notice">
          <div>
            <div className="notice-title">Couldn’t load building</div>
            <div className="notice-body">{error}</div>
          </div>
        </div>
      ) : !data ? null : !data.found ? (
        <div className="notice">
          <div>
            <div className="notice-title">Building not found</div>
            <div className="notice-body">No managed property matches this id.</div>
          </div>
        </div>
      ) : (
        <>
          <div className="section-head">
            <h2>{data.name}</h2>
            <span>
              Trailing {data.window_months} mo · {data.date_from} → {data.date_to} · {syncedLabel(data.synced_at)}
            </span>
          </div>

          <section className="grid" style={{ marginBottom: 18 }}>
            <div className="card">
              <div className="label">Income</div>
              <div className="value v-green">{money(data.total_income)}</div>
              <div className="sub">Operating income</div>
            </div>
            <div className="card">
              <div className="label">Operating Expense</div>
              <div className="value v-amber">{money(data.total_expense)}</div>
              <div className="sub">All expense accounts</div>
            </div>
            <div className="card">
              <div className="label">Net Operating Income</div>
              <div className="value" style={{ color: data.total_noi >= 0 ? "var(--green)" : "var(--red)" }}>
                {money(data.total_noi)}
              </div>
              <div className="sub">Income − expense</div>
            </div>
          </section>

          <div className="chart-card">
            <div className="chart-title">Income · Expense · NOI</div>
            <div className="chart-sub">Monthly from the general ledger</div>
            {hasActivity ? (
              <MonthlyFinancialsChart months={data.months} />
            ) : (
              <div style={{ color: "var(--text-faint)", padding: "40px 0", textAlign: "center", fontSize: 13 }}>
                No general-ledger activity in this window.
              </div>
            )}
          </div>

          {cats.length > 0 ? (
            <div className="table-card" style={{ marginTop: 18 }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Expense Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {cats.map(([name, amt]) => (
                    <tr key={name}>
                      <td><span className="bldg-name">{name}</span></td>
                      <td style={{ color: "var(--amber)" }}>{money(amt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      )}

      <footer className="foot">
        <span>Read-only — served from the GL cache.</span>
        <span>MacREI · Los Angeles County</span>
      </footer>
    </main>
  );
}
