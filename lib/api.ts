// Typed client for the autonomous-pm dashboard read-API.
// The base URL points at the FastAPI backend (local dev or the deployed
// Railway/Fly URL). AppFolio credentials live in that backend, never here.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8090";

export type PortfolioSummary = {
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate: number;
  open_work_orders: number;
  urgent_work_orders: number;
  active_tenants: number;
  gross_monthly_rent: number | null;
  total_past_due: number | null;
};

export type BuildingStats = {
  property_id: string;
  name: string;
  address: string;
  units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate: number;
  active_tenants: number;
  open_work_orders: number;
  gross_monthly_rent: number;
  total_past_due: number;
};

export async function fetchPortfolioSummary(): Promise<PortfolioSummary> {
  const res = await fetch(`${API_BASE}/api/portfolio/summary`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function fetchBuildings(): Promise<BuildingStats[]> {
  const res = await fetch(`${API_BASE}/api/portfolio/buildings`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export type BuildingFinancials = {
  property_id: string;
  name: string;
  income: number;
  operating_expense: number;
  noi: number;
};

export type PortfolioFinancials = {
  window_months: number;
  date_from: string;
  date_to: string;
  total_income: number;
  total_expense: number;
  total_noi: number;
  expense_by_category: Record<string, number>;
  buildings: BuildingFinancials[];
  synced_at: string | null;
};

// Server-side fetch (used by the Next route handler) — keeps creds/CORS server-side.
export async function fetchFinancials(months = 12): Promise<PortfolioFinancials> {
  const res = await fetch(`${API_BASE}/api/portfolio/financials?months=${months}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export type MonthlyFinancials = {
  month: string; // "YYYY-MM"
  income: number;
  operating_expense: number;
  noi: number;
};

export type PortfolioFinancialsTrend = {
  window_months: number;
  date_from: string;
  date_to: string;
  months: MonthlyFinancials[];
  synced_at: string | null;
};

// Server-side fetch for the monthly Income/Expense/NOI trend (the time dimension).
export async function fetchFinancialsTrend(
  months = 12,
): Promise<PortfolioFinancialsTrend> {
  const res = await fetch(
    `${API_BASE}/api/portfolio/financials/trend?months=${months}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export type BuildingFinancialsDetail = {
  property_id: string;
  name: string;
  found: boolean;
  window_months: number;
  date_from: string;
  date_to: string;
  total_income: number;
  total_expense: number;
  total_noi: number;
  expense_by_category: Record<string, number>;
  months: MonthlyFinancials[];
  synced_at: string | null;
};

// One building's financial drill-down (totals + expense categories + monthly trend).
export async function fetchBuildingFinancials(
  propertyId: string,
  months = 12,
): Promise<BuildingFinancialsDetail> {
  const res = await fetch(
    `${API_BASE}/api/portfolio/buildings/${encodeURIComponent(propertyId)}/financials?months=${months}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export type MonthlyAmount = { month: string; amount: number };

export type GlQuery = {
  kind: string; // income | expense | noi
  property_id: string | null;
  property_name: string | null;
  category: string | null;
  date_from: string;
  date_to: string;
  total: number;
  monthly: MonthlyAmount[];
  by_category: Record<string, number>;
  synced_at: string | null;
};

export type GlQueryParams = {
  kind?: string;
  property_id?: string;
  category?: string;
  months?: number;
  date_from?: string;
  date_to?: string;
};

function queryString(p: GlQueryParams): string {
  const q = new URLSearchParams();
  if (p.kind) q.set("kind", p.kind);
  if (p.property_id) q.set("property_id", p.property_id);
  if (p.category) q.set("category", p.category);
  if (p.months) q.set("months", String(p.months));
  if (p.date_from) q.set("date_from", p.date_from);
  if (p.date_to) q.set("date_to", p.date_to);
  return q.toString();
}

// Flexible GL query — the engine behind the Explore page.
export async function fetchGlQuery(p: GlQueryParams): Promise<GlQuery> {
  const res = await fetch(`${API_BASE}/api/portfolio/query?${queryString(p)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export { queryString as glQueryString };
