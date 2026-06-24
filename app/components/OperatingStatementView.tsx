import type { OperatingStatement, StatementGroup } from "@/lib/api";
import { usd0 } from "@/lib/format";

function pctOf(amount: number, base: number): string {
  if (!base) return "";
  return `${((amount / base) * 100).toFixed(1)}%`;
}

function GroupRows({ g, base }: { g: StatementGroup; base: number }) {
  return (
    <>
      <tr className="cat">
        <td>{g.name}</td>
        <td className="amt">{usd0(g.subtotal)}</td>
        <td className="pct">{pctOf(g.subtotal, base)}</td>
      </tr>
      {g.lines.map((ln) => (
        <tr key={ln.number + ln.name} className={`line${ln.amount === 0 ? " z" : ""}`}>
          <td className="name">{ln.name}</td>
          <td className="amt">{usd0(ln.amount)}</td>
          <td className="pct" />
        </tr>
      ))}
    </>
  );
}

// A full institutional operating statement — every income and expense line,
// grouped by category, with NOI and below-the-line through to cash flow.
export function OperatingStatementView({ st }: { st: OperatingStatement }) {
  const base = st.total_income || 1;
  return (
    <div className="tbl-wrap">
      <div className="tbl-scroll">
        <table className="stmt">
          <tbody>
            <tr className="sec"><td>Income</td><td className="amt">Amount</td><td className="pct">% Inc</td></tr>
            {st.income.map((g) => <GroupRows key={g.name} g={g} base={base} />)}
            <tr className="tot"><td>Total Income</td><td className="amt">{usd0(st.total_income)}</td><td className="pct">100%</td></tr>

            <tr className="sec"><td>Operating Expenses</td><td className="amt" /><td className="pct" /></tr>
            {st.operating_expense.map((g) => <GroupRows key={g.name} g={g} base={base} />)}
            <tr className="tot"><td>Total Operating Expense</td><td className="amt">{usd0(st.total_operating_expense)}</td><td className="pct">{pctOf(st.total_operating_expense, base)}</td></tr>

            <tr className="noi"><td>Net Operating Income</td><td className="amt">{usd0(st.noi)}</td><td className="pct">{st.noi_margin.toFixed(1)}%</td></tr>

            {st.below_line.length > 0 ? (
              <>
                <tr className="sec"><td>Below Net Operating Income</td><td className="amt" /><td className="pct" /></tr>
                {st.below_line.map((g) => <GroupRows key={g.name} g={g} base={base} />)}
              </>
            ) : null}

            <tr className="cf"><td>Cash Flow (pre-distribution)</td><td className="amt">{usd0(st.cash_flow)}</td><td className="pct">{pctOf(st.cash_flow, base)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
