import { NextResponse } from "next/server";
import { createOrderRecord } from "@/db";
import { product, shipping } from "@/lib/config";
import { computeTotals, unitSellPaise, unitMrpPaise, type CartLine } from "@/lib/money";
import { isEmail, isIndianMobile, isPincode } from "@/lib/india";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const livePayments = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

function newOrderNo() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, "0");
  return `ANC-${stamp}${rand}`;
}

type Payload = {
  lines?: { variantId?: string; outletId?: string; quantity?: number }[];
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    notes?: string;
  };
};

/** Server-side truth: we re-price everything from configuration, never trusting the browser. */
export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const rawLines = Array.isArray(payload.lines) ? payload.lines : [];
  if (rawLines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const lines: CartLine[] = [];
  for (const l of rawLines) {
    const variant = product.colorVariants.find((v) => v.id === l.variantId);
    if (!variant) return NextResponse.json({ error: "Unknown variant selected." }, { status: 400 });
    if (!variant.inStock) {
      return NextResponse.json(
        { error: `${variant.label} is not stocked right now. Choose an available finish.` },
        { status: 409 },
      );
    }
    if (l.outletId && l.outletId !== product.outlet.id) {
      return NextResponse.json({ error: "Only the Type-C configuration is sold." }, { status: 400 });
    }
    const qty = Math.floor(Number(l.quantity ?? 1));
    if (!Number.isFinite(qty) || qty < 1 || qty > product.maxQuantityPerOrder) {
      return NextResponse.json({ error: `Quantity must be between 1 and ${product.maxQuantityPerOrder}.` }, { status: 400 });
    }
    lines.push({
      lineId: `${variant.id}::${product.outlet.id}`,
      variantId: variant.id,
      variantLabel: variant.label,
      outletId: product.outlet.id,
      quantity: qty,
    });
  }

  const totals = computeTotals(lines);
  if (totals.itemCount === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const c = payload.customer ?? {};
  const name = String(c.name ?? "").trim();
  const email = String(c.email ?? "").trim().toLowerCase();
  const phone = String(c.phone ?? "").replace(/\D/g, "");
  const addressLine1 = String(c.addressLine1 ?? "").trim();
  const city = String(c.city ?? "").trim();
  const state = String(c.state ?? "").trim();
  const pincode = String(c.pincode ?? "").trim();

  const errors: Record<string, string> = {};
  if (name.length < 3) errors.name = "Enter the full name on the delivery.";
  if (!isEmail(email)) errors.email = "Enter a valid email for the receipt.";
  if (!isIndianMobile(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (addressLine1.length < 8) errors.addressLine1 = "Address looks too short to be deliverable.";
  if (city.length < 2) errors.city = "Enter your city or town.";
  if (state.length < 2) errors.state = "Select a state or union territory.";
  if (!isPincode(pincode)) errors.pincode = "Enter a valid 6-digit PIN code.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Please correct the highlighted fields.", fields: errors }, { status: 422 });
  }

  // final sanity check on configured pricing before we persist
  const expected = lines.reduce((sum, l) => sum + unitSellPaise(l.variantId) * l.quantity, 0);
  if (expected !== totals.subtotalPaise) {
    return NextResponse.json({ error: "Pricing could not be verified. Please try again." }, { status: 500 });
  }

  const orderNo = newOrderNo();

  let gatewayOrderId: string | null = null;
  let gatewayNote: string | null = null;

  if (livePayments) {
    try {
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
        },
        body: JSON.stringify({
          amount: totals.totalPaise, // paise = the smallest unit for INR
          currency: "INR",
          receipt: orderNo,
          notes: { store: product.supplier.sku, items: String(totals.itemCount) },
        }),
      });
      const json = (await res.json()) as { id?: string; error?: { description?: string } };
      if (!res.ok || !json.id) throw new Error(json.error?.description ?? "gateway rejected order");
      gatewayOrderId = json.id;
    } catch (err) {
      gatewayNote = err instanceof Error ? err.message : "gateway unavailable";
      // Never block the customer silently: fall back to an explicit unpaid order.
    }
  }

  const row = await createOrderRecord(
    {
      orderNo,
      email,
      customerName: name,
      phone,
      addressLine1,
      addressLine2: String(c.addressLine2 ?? "").trim() || null,
      city,
      state,
      pincode,
      notes: String(c.notes ?? "").trim() || null,
      mrpPaise: totals.mrpPaise,
      subtotalPaise: totals.subtotalPaise,
      discountPaise: totals.discountPaise,
      shippingPaise: totals.freeShipping ? 0 : shipping.standardPaise,
      totalPaise: totals.totalPaise,
      status: "pending_payment",
      paymentProvider: livePayments && gatewayOrderId ? "razorpay" : "demo",
      paymentOrderId: gatewayOrderId,
      items: lines.map((l) => ({
        variantId: l.variantId,
        variantLabel: l.variantLabel,
        quantity: l.quantity,
        unitSellPaise: unitSellPaise(l.variantId),
        unitMrpPaise: unitMrpPaise(l.variantId),
      })),
      meta: { livePayments, gatewayNote, userAgent: request.headers.get("user-agent") },
    },
    lines.map((l) => ({
      productId: product.slug,
      variantId: l.variantId,
      variantLabel: l.variantLabel,
      outletId: l.outletId,
      quantity: l.quantity,
      unitSellPaise: unitSellPaise(l.variantId),
      unitMrpPaise: unitMrpPaise(l.variantId),
    })),
  );

  return NextResponse.json({
    ok: true,
    orderNo: row.orderNo,
    totalPaise: row.totalPaise,
    totals,
    checkoutMode: livePayments && gatewayOrderId ? "razorpay" : "demo",
    razorpay: livePayments && gatewayOrderId ? { keyId: RAZORPAY_KEY_ID, orderId: gatewayOrderId } : null,
    note: gatewayNote,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    livePayments,
    items: shipping.codAvailable ? "COD + prepaid" : "prepaid only",
  });
}
