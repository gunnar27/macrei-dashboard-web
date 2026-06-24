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
  expense_buckets: Record<string, number>;
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
  expense_buckets: Record<string, number>;
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
  expense_buckets: Record<string, number>;
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

// ── Rent roll ──────────────────────────────────────────────────────────────
export type RentRollUnit = {
  property_id: string;
  property_name: string;
  unit_id: string;
  unit_name: string;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  market_rent: number;
  actual_rent: number;
  status: string;
  tenant_name: string | null;
  lease_start: string | null;
  lease_end: string | null;
  is_mtm: boolean;
  days_vacant: number | null;
  rent_ready: boolean | null;
};
export type RentRollSummary = {
  total_units: number;
  revenue_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate: number;
  gross_potential_rent: number;
  in_place_rent: number;
  loss_to_lease: number;
  vacancy_loss: number;
  month_to_month: number;
  expiring_30: number;
  expiring_60: number;
  expiring_90: number;
};
export type RentRoll = {
  property_id: string | null;
  property_name: string | null;
  as_of: string;
  summary: RentRollSummary;
  units: RentRollUnit[];
};
export async function fetchRentRoll(propertyId?: string): Promise<RentRoll> {
  const q = propertyId ? `?property_id=${encodeURIComponent(propertyId)}` : "";
  const res = await fetch(`${API_BASE}/api/portfolio/rent-roll${q}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Delinquency aging ──────────────────────────────────────────────────────
export type PropertyAging = {
  property_id: string;
  property_name: string;
  bucket_0_30: number;
  bucket_31_60: number;
  bucket_61_90: number;
  bucket_90_plus: number;
  total: number;
};
export type DelinquencyAging = {
  as_of: string;
  bucket_0_30: number;
  bucket_31_60: number;
  bucket_61_90: number;
  bucket_90_plus: number;
  total: number;
  by_property: PropertyAging[];
};
export async function fetchAging(): Promise<DelinquencyAging> {
  const res = await fetch(`${API_BASE}/api/portfolio/aging`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Lease expirations ──────────────────────────────────────────────────────
export type LeaseExpiration = {
  property_id: string;
  property_name: string;
  unit_name: string;
  tenant_name: string | null;
  lease_end: string | null;
  days_until: number | null;
  is_mtm: boolean;
  current_rent: number;
};
export type LeaseExpirations = {
  as_of: string;
  expiring_30: number;
  expiring_60: number;
  expiring_90: number;
  month_to_month: number;
  leases: LeaseExpiration[];
};
export async function fetchLeaseExpirations(withinDays = 120): Promise<LeaseExpirations> {
  const res = await fetch(`${API_BASE}/api/portfolio/lease-expirations?within_days=${withinDays}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Work orders ────────────────────────────────────────────────────────────
export type WorkOrderRow = {
  id: string;
  number: string;
  property_id: string;
  property_name: string;
  unit_name: string | null;
  status: string;
  priority: string;
  type: string;
  trade: string | null;
  created_on: string | null;
  completed_on: string | null;
  age_days: number | null;
  is_open: boolean;
  description: string;
};
export type WorkOrderSummary = {
  total: number;
  open: number;
  urgent_open: number;
  completed: number;
  avg_open_age_days: number;
  oldest_open_age_days: number;
  by_priority: Record<string, number>;
  by_trade: Record<string, number>;
};
export type WorkOrders = {
  as_of: string;
  property_id: string | null;
  summary: WorkOrderSummary;
  work_orders: WorkOrderRow[];
};
export async function fetchWorkOrders(propertyId?: string): Promise<WorkOrders> {
  const q = propertyId ? `?property_id=${encodeURIComponent(propertyId)}` : "";
  const res = await fetch(`${API_BASE}/api/portfolio/work-orders${q}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Natural-language Ask ────────────────────────────────────────────────────
export type AskResult = {
  question: string;
  answer: string;
  kind: string;
  property_id: string | null;
  property_name: string | null;
  category: string | null;
  months: number;
  query: GlQuery;
};
export async function fetchAsk(q: string): Promise<AskResult> {
  const res = await fetch(`${API_BASE}/api/portfolio/ask?q=${encodeURIComponent(q)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Operating statement (full P&L) ──────────────────────────────────────────
export type StatementLine = { number: string; name: string; amount: number };
export type StatementGroup = { number: string; name: string; subtotal: number; lines: StatementLine[] };
export type OperatingStatement = {
  property_id: string | null;
  property_name: string | null;
  window_months: number;
  date_from: string;
  date_to: string;
  total_income: number;
  income: StatementGroup[];
  total_operating_expense: number;
  operating_expense: StatementGroup[];
  noi: number;
  noi_margin: number;
  debt_service: number;
  capex: number;
  depreciation: number;
  below_line: StatementGroup[];
  cash_flow: number;
  synced_at: string | null;
};
export async function fetchOperatingStatement(propertyId?: string, months = 12): Promise<OperatingStatement> {
  const p = new URLSearchParams({ months: String(months) });
  if (propertyId) p.set("property_id", propertyId);
  const res = await fetch(`${API_BASE}/api/portfolio/operating-statement?${p.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}
