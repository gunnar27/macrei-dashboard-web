import Link from "next/link";
import {
  fetchFinancials,
  fetchOperatingStatement,
  type OperatingStatement,
  type PortfolioFinancials,
} from "@/lib/api";
import { pct, syncedLabel, usd0 } from "@/lib/format";
import { OperatingStatementView } from "../components/OperatingStatementView";
import { TrendSection } from "../components/TrendSection";
import { BridgeRow, Stat } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function FinancialsPage() {
  let data: PortfolioFinancials | null = null;
  let statement: OperatingStatement | null = null;
  let error: string | null = null;
  try {
    [data, statement] = await Promise.all([fetchFinancials(12), fetchOperatingStatement()]);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const b = data?.expense_buckets ?? {};
  const debt = b.debt ?? 0;
  const capex = b.capex ?? 0;
  const depr = b.depreciation ?? 0;
  const cashFlow = data ? data.total_noi - debt - capex : 0;
  const margin = data && data.total_income ? (data.total_noi / data.total_income) * 100 : 0;

  return (
    <main className="wrap">
      <div className="page-head">
        <div>
          <h1 className="page-title">Financials</h1>
          <div className="page-subtitle">
            {data ? `Trailing ${data.window_months} mo · ${data.date_from} → ${data.date_to} · ${syncedLabel(data.synced_at)}` : "Income, OpEx & NOI"}
          </div>
        </div>
        <div className="status-pill"><span className="dot" />Live · Read-only</div>
      </div>

      {error ? (
        <div className="notice"><div><div className="notice-title">Couldn’t load financials</div><div className="notice-body">{error}</div></div></div>
      ) : !data ? null : (
        <>
          <section className="stat-grid" style={{ marginBottom: 16 }}>
            <Stat k="Operating Income" v={usd0(data.total_income)} s="Rental + other income" accent="green" />
            <Stat k="Operating Expense" v={usd0(data.total_expense)} s="Excludes debt / capex / depr." accent="amber" />
            <Stat k="Net Operating Income" v={usd0(data.total_noi)} s={`${pct(margin)} NOI margin`} accent={data.total_noi >= 0 ? "green" : "red"} />
            <Stat k="Cash Flow" v={usd0(cashFlow)} s="NOI − debt service − capex" accent={cashFlow >= 0 ? "blue" : "red"} />
          </section>

          <div className="panel" style={{ marginBottom: 18 }}>
            <div className="panel-title">NOI Waterfall</div>
            <div className="panel-sub">Operating income through to cash flow</div>
            <div className="bridge">
              <BridgeRow label="Operating Income" amount={usd0(data.total_income)} pctOf={1} color="var(--green)" />
              <BridgeRow label="Less: Operating Expense" amount={`(${usd0(data.total_expense)})`} pctOf={data.total_expense / (data.total_income || 1)} color="var(--amber)" />
              <BridgeRow label="Net Operating Income" amount={usd0(data.total_noi)} pctOf={data.total_noi / (data.total_income || 1)} color="var(--green)" total />
              <BridgeRow label="Less: Debt Service" amount={`(${usd0(debt)})`} pctOf={debt / (data.total_income || 1)} color="var(--violet)" />
              <BridgeRow label="Less: Capital Expenditures" amount={`(${usd0(capex)})`} pctOf={capex / (data.total_income || 1)} color="var(--blue)" />
              <BridgeRow label="Cash Flow (pre-distribution)" amount={usd0(cashFlow)} pctOf={cashFlow / (data.total_income || 1)} color={cashFlow >= 0 ? "var(--green)" : "var(--red)"} total />
            </div>
            {depr > 0 ? <div className="panel-sub" style={{ marginTop: 10 }}>Depreciation {usd0(depr)} (non-cash) shown for reference, excluded from cash flow.</div> : null}
          </div>

          {statement ? (
            <>
              <div className="section-head"><h2>Operating Statement</h2><span>Every line item · trailing {statement.window_months} mo</span></div>
              <div style={{ marginBottom: 18 }}>
                <OperatingStatementView st={statement} />
              </div>
            </>
          ) : null}

          <TrendSection months={12} />

          <div className="section-head" style={{ marginTop: 22 }}>
            <h2>NOI by Building</h2>
            <span>{data.buildings.length} properties</span>
          </div>
          <div className="tbl-wrap">
            <div className="tbl-scroll">
              <table className="rt">
                <thead>
                  <tr><th>Building</th><th className="r">Income</th><th className="r">Op. Expense</th><th className="r">NOI</th><th className="r">Margin</th></tr>
                </thead>
                <tbody>
                  {data.buildings.map((bld) => {
                    const m = bld.income ? (bld.noi / bld.income) * 100 : 0;
                    return (
                      <tr key={bld.property_id}>
                        <td style={{ fontWeight: 600 }}>
                          <Link href={`/buildings/${bld.property_id}`} className="bldg-link"><span className="bldg-name">{bld.name}</span></Link>
                        </td>
                        <td className="r num pos">{usd0(bld.income)}</td>
                        <td className="r num warn-c">{usd0(bld.operating_expense)}</td>
                        <td className="r num" style={{ fontWeight: 700, color: bld.noi >= 0 ? "var(--green)" : "var(--red)" }}>{usd0(bld.noi)}</td>
                        <td className="r dim">{pct(m)}</td>
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
        <span>NOI excludes debt service, capital expenditures, depreciation, and owner draws — institutional standard.</span>
        <span>MacREI</span>
      </footer>
    </main>
  );
}
