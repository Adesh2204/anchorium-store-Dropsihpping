import { NextResponse } from "next/server";
import { createContactRecord } from "@/db";
import { isEmail } from "@/lib/india";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, string | undefined>;
  try {
    body = (await request.json()) as Record<string, string | undefined>;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const message = String(body.message ?? "").trim();
  const topic = String(body.topic ?? "general").slice(0, 40);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please tell us your name.";
  if (!isEmail(email)) errors.email = "A valid email so we can reply.";
  if (message.length < 15) errors.message = "A little more detail helps us answer properly.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Please correct the highlighted fields.", fields: errors }, { status: 422 });
  }

  const reference = `SUP-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  await createContactRecord({
    reference,
    name,
    email,
    phone: String(body.phone ?? "").replace(/\D/g, "").slice(0, 12) || null,
    orderNo: String(body.orderNo ?? "").trim().slice(0, 24).toUpperCase() || null,
    topic,
    message: message.slice(0, 4000),
  });

  return NextResponse.json({ ok: true, reference });
}
