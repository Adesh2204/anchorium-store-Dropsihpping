import fs from "node:fs";
import path from "node:path";
import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  contactMessages,
  orderItems,
  orders,
  type ContactMessage,
  type Order,
  type OrderItem,
} from "./schema";

const databaseUrl =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 1500,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);

/* ------------------------------------------------------------------ *
 * Local JSON fallback store when PostgreSQL is not running locally
 * ------------------------------------------------------------------ */

type LocalStore = {
  orders: Order[];
  orderItems: OrderItem[];
  contactMessages: ContactMessage[];
};

const STORE_FILE = path.join(process.cwd(), ".data", "local-db.json");

function readLocalStore(): LocalStore {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      return { orders: [], orderItems: [], contactMessages: [] };
    }
    const raw = JSON.parse(fs.readFileSync(STORE_FILE, "utf8")) as LocalStore;
    return {
      orders: (raw.orders ?? []).map((o) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
        paidAt: o.paidAt ? new Date(o.paidAt) : null,
      })),
      orderItems: raw.orderItems ?? [],
      contactMessages: (raw.contactMessages ?? []).map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      })),
    };
  } catch {
    return { orders: [], orderItems: [], contactMessages: [] };
  }
}

function writeLocalStore(store: LocalStore) {
  fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function checkDbHealth(): Promise<{ ok: boolean; mode: "postgres" | "local" }> {
  try {
    await db.execute(sql`select 1`);
    return { ok: true, mode: "postgres" };
  } catch {
    readLocalStore();
    return { ok: true, mode: "local" };
  }
}

export async function createOrderRecord(
  orderInput: typeof orders.$inferInsert,
  itemsInput: Omit<typeof orderItems.$inferInsert, "orderId">[],
): Promise<{ id: number; orderNo: string; totalPaise: number }> {
  try {
    const [row] = await db
      .insert(orders)
      .values(orderInput)
      .returning({ id: orders.id, orderNo: orders.orderNo, totalPaise: orders.totalPaise });

    if (itemsInput.length > 0) {
      await db.insert(orderItems).values(
        itemsInput.map((item) => ({
          ...item,
          orderId: row.id,
        })),
      );
    }
    return row;
  } catch {
    const store = readLocalStore();
    const id = (store.orders.at(-1)?.id ?? 0) + 1;
    const now = new Date();
    const record: Order = {
      id,
      orderNo: orderInput.orderNo,
      email: orderInput.email,
      customerName: orderInput.customerName,
      phone: orderInput.phone,
      addressLine1: orderInput.addressLine1,
      addressLine2: orderInput.addressLine2 ?? null,
      city: orderInput.city,
      state: orderInput.state,
      pincode: orderInput.pincode,
      notes: orderInput.notes ?? null,
      mrpPaise: orderInput.mrpPaise,
      subtotalPaise: orderInput.subtotalPaise,
      discountPaise: orderInput.discountPaise ?? 0,
      shippingPaise: orderInput.shippingPaise ?? 0,
      totalPaise: orderInput.totalPaise,
      status: orderInput.status ?? "pending_payment",
      paymentProvider: orderInput.paymentProvider ?? "demo",
      paymentOrderId: orderInput.paymentOrderId ?? null,
      paymentId: orderInput.paymentId ?? null,
      paymentSignature: orderInput.paymentSignature ?? null,
      paymentVerified: orderInput.paymentVerified ?? false,
      paidAt: orderInput.paidAt ?? null,
      items: orderInput.items ?? [],
      meta: orderInput.meta ?? null,
      createdAt: now,
      updatedAt: now,
    };
    store.orders.push(record);
    let nextItemId = (store.orderItems.at(-1)?.id ?? 0) + 1;
    for (const item of itemsInput) {
      store.orderItems.push({
        id: nextItemId++,
        orderId: id,
        productId: item.productId,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
        outletId: item.outletId,
        quantity: item.quantity,
        unitMrpPaise: item.unitMrpPaise,
        unitSellPaise: item.unitSellPaise,
      });
    }
    writeLocalStore(store);
    return { id: record.id, orderNo: record.orderNo, totalPaise: record.totalPaise };
  }
}

export async function getOrderByRef(ref: string): Promise<Order | null> {
  const normalized = ref.toUpperCase();
  try {
    const [row] = await db.select().from(orders).where(eq(orders.orderNo, normalized)).limit(1);
    if (row) return row;
  } catch {
    // Fall through to local store
  }
  const store = readLocalStore();
  return store.orders.find((o) => o.orderNo.toUpperCase() === normalized) ?? null;
}

export async function verifyOrderRecord(
  ref: string,
  paymentOrderId: string,
  paymentId: string,
  paymentSignature: string,
  valid: boolean,
): Promise<{ orderNo: string; status: string; paymentVerified: boolean } | null> {
  const normalized = ref.toUpperCase();
  try {
    const [row] = await db
      .update(orders)
      .set(
        valid
          ? {
              status: "paid",
              paymentId,
              paymentSignature,
              paymentVerified: true,
              paidAt: new Date(),
              updatedAt: new Date(),
            }
          : {
              status: "payment_failed",
              paymentId,
              paymentVerified: false,
              updatedAt: new Date(),
            },
      )
      .where(and(eq(orders.orderNo, normalized), eq(orders.paymentOrderId, paymentOrderId)))
      .returning({
        orderNo: orders.orderNo,
        status: orders.status,
        paymentVerified: orders.paymentVerified,
      });
    return row ?? null;
  } catch {
    const store = readLocalStore();
    const order = store.orders.find(
      (o) => o.orderNo.toUpperCase() === normalized && o.paymentOrderId === paymentOrderId,
    );
    if (!order) return null;
    const now = new Date();
    order.paymentId = paymentId;
    order.updatedAt = now;
    if (valid) {
      order.status = "paid";
      order.paymentSignature = paymentSignature;
      order.paymentVerified = true;
      order.paidAt = now;
    } else {
      order.status = "payment_failed";
      order.paymentVerified = false;
    }
    writeLocalStore(store);
    return {
      orderNo: order.orderNo,
      status: order.status,
      paymentVerified: order.paymentVerified,
    };
  }
}

export async function createContactRecord(
  input: typeof contactMessages.$inferInsert,
): Promise<void> {
  try {
    await db.insert(contactMessages).values(input);
  } catch {
    const store = readLocalStore();
    const id = (store.contactMessages.at(-1)?.id ?? 0) + 1;
    store.contactMessages.push({
      id,
      reference: input.reference,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      orderNo: input.orderNo ?? null,
      topic: input.topic,
      message: input.message,
      status: input.status ?? "open",
      createdAt: new Date(),
    });
    writeLocalStore(store);
  }
}

