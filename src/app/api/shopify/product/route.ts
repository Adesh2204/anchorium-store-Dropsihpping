import { NextResponse } from "next/server";
import { getLiveProductConfig } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const liveConfig = await getLiveProductConfig();
    return NextResponse.json({ ok: true, product: liveConfig });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load product" }, { status: 500 });
  }
}

