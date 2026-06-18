import { NextRequest, NextResponse } from "next/server";
import { fetchFinancials } from "@/lib/api";

// Same-origin proxy to the backend financials endpoint. Runs server-side so the
// browser never needs CORS or the backend URL, and the heavy GL query is lazy-
// loaded by the client section instead of blocking the main page render.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const months = Number(req.nextUrl.searchParams.get("months") ?? "12") || 12;
  try {
    const data = await fetchFinancials(months);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
