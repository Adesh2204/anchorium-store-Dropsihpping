import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getOrderByRef, verifyOrderRecord } from "@/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-side payment verification. An order is only ever marked paid here —
 * the browser can never assert a successful payment by itself.
 */
export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return NextResponse.json(
      {
        error:
          "Live payments are not configured on this deployment (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET). The order is stored as awaiting payment.",
        code: "payments_not_configured",
      },
      { status: 409 },
    );
  }

  let body: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment identifiers." }, { status: 400 });
  }

  const expected = createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(razorpay_signature), "utf8");
  const valid = a.length === b.length && timingSafeEqual(a, b);

  const row = await verifyOrderRecord(
    ref,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    valid,
  );

  if (!row) {
    return NextResponse.json({ error: "Order reference did not match the payment." }, { status: 409 });
  }

  return NextResponse.json({
    ok: valid,
    verified: valid,
    status: row.status,
    orderNo: row.orderNo,
    message: valid ? "Payment verified." : "Signature verification failed.",
  });
}

export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const order = await getOrderByRef(ref);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ok: true,
    status: order.status,
    verified: order.paymentVerified,
    provider: order.paymentProvider,
  });
}
