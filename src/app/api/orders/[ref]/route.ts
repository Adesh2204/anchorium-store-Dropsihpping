import { NextResponse } from "next/server";
import { getOrderByRef } from "@/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public order status for the confirmation screen — no address or contact data exposed. */
export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const row = await getOrderByRef(ref);

  if (!row) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({
    ok: true,
    order: {
      orderNo: row.orderNo,
      status: row.status,
      paymentProvider: row.paymentProvider,
      paymentVerified: row.paymentVerified,
      paidAt: row.paidAt,
      createdAt: row.createdAt,
      totalPaise: row.totalPaise,
      subtotalPaise: row.subtotalPaise,
      discountPaise: row.discountPaise,
      shippingPaise: row.shippingPaise,
      mrpPaise: row.mrpPaise,
      items: row.items,
    },
  });
}
