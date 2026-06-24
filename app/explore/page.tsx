import { fetchBuildings, fetchGlQuery } from "@/lib/api";
import { ExplorePanel } from "../components/ExplorePanel";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  let buildings: { property_id: string; name: string }[] = [];
  let categories: string[] = [];
  let error: string | null = null;
  try {
    const [b, q] = await Promise.all([
      fetchBuildings(),
      fetchGlQuery({ kind: "expense", months: 24 }),
    ]);
    buildings = b.map((x) => ({ property_id: x.property_id, name: x.name }));
    categories = Object.keys(q.by_category);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="wrap">
      <div className="page-head">
        <div>
          <h1 className="page-title">Explore</h1>
          <div className="page-subtitle">Ask the ledger — income, expense, or NOI for any property, category, and window.</div>
        </div>
        <div className="status-pill"><span className="dot" />Live · Read-only</div>
      </div>

      {error ? (
        <div className="notice"><div><div className="notice-title">Couldn’t load Explore</div><div className="notice-body">{error}</div></div></div>
      ) : (
        <ExplorePanel buildings={buildings} categories={categories} />
      )}

      <footer className="foot">
        <span>e.g. Expense · Garbage and Recycling · one property · last 12 months.</span>
        <span>MacREI</span>
      </footer>
    </main>
  );
}
