import { NextRequest, NextResponse } from "next/server";
import { fetchAsk } from "@/lib/api";

// Same-origin proxy to the backend NL Ask endpoint.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ error: "Empty question." }, { status: 400 });
  if (q.length > 500) return NextResponse.json({ error: "Question too long (max 500 chars)." }, { status: 400 });
  try {
    return NextResponse.json(await fetchAsk(q));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
