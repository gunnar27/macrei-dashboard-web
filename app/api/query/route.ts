import { NextRequest, NextResponse } from "next/server";
import { fetchGlQuery, type GlQueryParams } from "@/lib/api";

// Same-origin proxy to the backend GL query engine — keeps the backend URL/CORS
// server-side so the interactive Explore client can query freely.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const params: GlQueryParams = {
    kind: sp.get("kind") ?? undefined,
    property_id: sp.get("property_id") ?? undefined,
    category: sp.get("category") ?? undefined,
    months: sp.get("months") ? Number(sp.get("months")) : undefined,
    date_from: sp.get("date_from") ?? undefined,
    date_to: sp.get("date_to") ?? undefined,
  };
  try {
    return NextResponse.json(await fetchGlQuery(params));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
