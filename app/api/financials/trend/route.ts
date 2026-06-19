import { NextRequest, NextResponse } from "next/server";
import { fetchFinancialsTrend } from "@/lib/api";

// Same-origin proxy to the backend financials-trend endpoint. Runs server-side so
// the browser never needs CORS or the backend URL; the heavy monthly GL query is
// lazy-loaded by the client trend section instead of blocking the main render.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const months = Number(req.nextUrl.searchParams.get("months") ?? "12") || 12;
  try {
    const data = await fetchFinancialsTrend(months);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
