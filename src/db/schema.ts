import { index, integer, jsonb, pgTable, serial, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core";

/**
 * Anchorium Store — order management schema.
 * All money is stored as integer paise so totals can never drift through floats.
 */

export const orders = pgTable(
  "anchorium_orders",
  {
    id: serial("id").primaryKey(),
    orderNo: varchar("order_no", { length: 24 }).notNull().unique(),
    email: varchar("email", { length: 254 }).notNull(),
    customerName: varchar("customer_name", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 24 }).notNull(),
    addressLine1: text("address_line1").notNull(),
    addressLine2: text("address_line2"),
    city: varchar("city", { length: 80 }).notNull(),
    state: varchar("state", { length: 80 }).notNull(),
    pincode: varchar("pincode", { length: 8 }).notNull(),
    notes: text("notes"),

    mrpPaise: integer("mrp_paise").notNull(),
    subtotalPaise: integer("subtotal_paise").notNull(),
    discountPaise: integer("discount_paise").notNull().default(0),
    shippingPaise: integer("shipping_paise").notNull().default(0),
    totalPaise: integer("total_paise").notNull(),

    /** pending_payment | paid | payment_failed | cancelled | fulfilled */
    status: varchar("status", { length: 24 }).notNull().default("pending_payment"),
    paymentProvider: varchar("payment_provider", { length: 32 }).notNull().default("demo"),
    paymentOrderId: varchar("payment_order_id", { length: 64 }),
    paymentId: varchar("payment_id", { length: 64 }),
    paymentSignature: varchar("payment_signature", { length: 128 }),
    /** only true after the backend verified a gateway signature */
    paymentVerified: boolean("payment_verified").notNull().default(false),
    paidAt: timestamp("paid_at", { withTimezone: true }),

    items: jsonb("items").notNull().default([]),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("anchorium_orders_no_idx").on(t.orderNo),
    index("anchorium_orders_email_idx").on(t.email),
  ],
);

export const orderItems = pgTable("anchorium_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 40 }).notNull(),
  variantId: varchar("variant_id", { length: 40 }).notNull(),
  variantLabel: varchar("variant_label", { length: 80 }).notNull(),
  outletId: varchar("outlet_id", { length: 40 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitMrpPaise: integer("unit_mrp_paise").notNull(),
  unitSellPaise: integer("unit_sell_paise").notNull(),
});

export const contactMessages = pgTable(
  "anchorium_contact_messages",
  {
    id: serial("id").primaryKey(),
    reference: varchar("reference", { length: 20 }).notNull().unique(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    phone: varchar("phone", { length: 24 }),
    orderNo: varchar("order_no", { length: 24 }),
    topic: varchar("topic", { length: 40 }).notNull(),
    message: text("message").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("anchorium_contact_email_idx").on(t.email)],
);

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
