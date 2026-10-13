# Anchorium Store — AuraGlow

Premium single-product storefront for a rechargeable ambient LED lamp sourced from
CJdropshipping (SKU `CJJT180225501AZ`). Built with Next.js (App Router) + TypeScript +
Tailwind CSS v4, Framer Motion, GSAP ScrollTrigger, React Three Fiber and Drizzle/PostgreSQL.

> **Product fidelity is the governing rule.** Every photograph, technical drawing and the 3D
> model describe the *same* physical article as the supplier listing. The transparent cylindrical
> PC cover with rolled rim, the rounded-square ABS base, the single front touch circle with an
> indicator pinhole beneath it, the suspended flexible filament with a brass bead, the Type-C
> inlet and the **70 × 70 × 145 mm** envelope are preserved. Nothing was redesigned, and nothing
> that cannot be verified is claimed.

---

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Cinematic scroll story (scenes A–H): brand reveal → product → design → atmosphere → modes → charging → Diwali campaign → conversion |
| `/product/auraglow` | Product detail: gallery, variants, pricing, specifications, package, care, accordions |
| `/product/auraglow/3d-view` | **Dedicated interactive 3D viewer** (real GLB, orbit/zoom/presets/fullscreen, two filament states, finishes) |
| `/cart` | Persistent cart, quantity editing, removal, live subtotal/shipping/total |
| `/checkout` | Indian checkout (name, mobile, email, address, city, state, PIN), payment method, server-priced order creation |
| `/order-confirmation` | Reference, line items, verified amount breakdown, status straight from the database |
| `/contact` | Support form (writes to `anchorium_contact_messages`) + configurable channels |
| `/faq` | Product, charging, lighting, shipping, payment, returns, care |
| `/shipping-policy`, `/returns-refunds`, `/privacy-policy`, `/terms-and-conditions` | Editable policy templates, clearly badged as such |

The homepage deliberately contains **no** WebGL canvas; `Explore in 3D` routes to the dedicated
viewer page.

---

## Configuration layer (single source of truth)

`src/lib/config.ts` holds everything commercial, so no page hard-codes a number:

```ts
product.pricing   → { mrpPaise: 500000, sellPaise: 400000 }   // ₹5,000 → ₹4,000, 20 % off, ₹1,000 saved
product.campaign  → { name: "Diwali Glow Sale", active: true, endsAt: "2026-11-11T23:59:59+05:30" }
product.colorVariants → Ivory White / Graphite in stock; Marigold / Verdigris listed but not stocked
shipping          → flat ₹99, 5–9 business days, freeThreshold null, COD disabled
payment           → razorpay, live only when both keys exist
site.support      → env-driven email / phone / address
```

`pricingFor()` is the only discount formula; the countdown reads `campaign.endsAt` and never
resets. Money is integer **paise** everywhere (`src/lib/money.ts`), formatted with
`Intl.NumberFormat("en-IN")`.

Specifications published on the site come from the listing: transparent PC cover, ABS base,
70 × 70 × 145 mm, 1,500 mAh Li-ion, Type-C, 2700 K, 6–55 lm, constant + breathing modes,
25,000 h lamp life, IP20, efficiency grade G, packing list = “Ambient Light × 1”.
Unverified items (runtime, charge time, warranty) are listed as *not published* rather than guessed.
The listing's "waterproof" phrasing is **not** repeated, because IP20 does not support it.

---

## Assets

```
public/product/source-01.jpg        ← authentic supplier photograph (the fidelity anchor, unmodified)
public/product/hero-cinematic.jpg   ← brand visualisation of the same product
public/product/lifestyle-*.jpg      ← bedside / desk / Diwali brand visualisations
public/models/auraglow.glb          ← exported GLB (loop filament)
public/models/auraglow-sculpt.glb   ← exported GLB (styled double bend)
public/models/auraglow.manifest.json
src/app/icon.svg                    ← vector favicon (A + suspended filament)
src/lib/lamp-geometry.ts            ← parametric model source of truth (mm)
assets/source/build_auraglow.py     ← Blender bootstrap to regenerate an editable .blend
assets/source/README.md             ← reconstruction procedure + fidelity checklist
```

Regenerate the GLBs after touching geometry:

```bash
npx tsx scripts/build-model.mts
```

Lifestyle/studio frames were produced under a constrained brief that locks the product geometry;
they are labelled **“Brand visualisation”** in the gallery and diagrams are labelled
**“Technical drawing”** (they exist because the listing has no photo of the rear face or the
dimensions). The USB-C *recess position* is the one detail flagged as unconfirmed in the UI.

---

## Logo

`src/components/Logo.tsx` — one shared component: geometric **A** whose crossbar is a sagging
filament, with an illumination arc. Exports `AnchoriumMark` (icon/mobile/favicon), `Wordmark`,
and the horizontal lockup, in `light` and `dark` variants. The favicon in `src/app/icon.svg`
is the simplified mark. Used identically in header, homepage, product, 3D viewer, cart,
checkout, confirmation, policies and footer. Spelling is always **Anchorium Store**.

---

## Database & orders

```
anchorium_orders          status pending_payment | paid | payment_failed | cancelled | fulfilled
anchorium_order_items     per-line variant, quantity, unit MRP and sell price (paise)
anchorium_contact_messages support threads with reference
```

Apply the schema:

```bash
npx drizzle-kit push          # or: npx drizzle-kit generate && npm run db:migrate
```

### API

* `POST /api/orders` — validates contact/PIN/mobile, **re-prices** everything from config
  (client amounts are ignored), rejects out-of-stock variants, persists the order, and when
  Razorpay keys exist creates a gateway order (`amount` in paise).
* `POST /api/orders/[ref]/verify` — recomputes `HMAC_SHA256(order_id|payment_id, key_secret)`
  and compares with `timingSafeEqual`. **Only here** does an order become `paid`.
* `GET /api/orders/[ref]` / `GET /api/orders/[ref]/verify` — status for the confirmation screen.
* `POST /api/contact` — stores a support message and returns `SUP-XXXXXX`.

### Payment state

With no keys, checkout still creates a real order row and the UI says so in plain words:
*“Checkout interface is live; the payment gateway is not connected.”* The order stays
`pending_payment` and the confirmation page never shows “paid”.

---

## Environment

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
RAZORPAY_KEY_ID=            # optional — enables live payments
RAZORPAY_KEY_SECRET=        # optional — enables signature verification + live payments
NEXT_PUBLIC_SUPPORT_EMAIL=support@anchorium.store
NEXT_PUBLIC_SUPPORT_PHONE=  # leave unset until the business confirms a number
NEXT_PUBLIC_BUSINESS_ADDRESS=Line 1|Line 2|City   # pipe-separated
NEXT_PUBLIC_LEGAL_NAME=Anchorium Store
```

Secrets are read server-side only; the browser never sees key material. `GET /api/health`
is the deployment healthcheck.

---

## Local development

```bash
npm install
npx drizzle-kit push          # create tables
npm run dev                   # http://localhost:3000
```

Production:

```bash
npm run build && npm run start
```

Deploy anywhere that runs Node 20+ with a Postgres URL (Vercel / Railway / Fly / a VPS +
`next start` behind nginx). Set the env vars above, run `drizzle-kit push` (or the generated
migration), and the GLBs are served statically from `public/models`.

---

## Accessibility, motion and performance

* `prefers-reduced-motion`: GSAP contexts are skipped, Framer reveals collapse to static, the
  idle auto-orbit stops, the breathing-mode demo stops.
* Skip link, semantic landmarks, labelled inputs with `aria-invalid` + inline errors, `aria-pressed`
  on toggles, keyboard `←/→` in the gallery, native `<details>` accordions.
* Images are `next/image` with `sizes`; the 3D canvas is `dynamic(..., { ssr: false })` and the GLB
  only loads on the viewer route. Geometry is decimated for the web (72-segment lathe, 150-segment
  filament sweep) — ~360 KB per GLB.
* No WebGL → the viewer shows the authentic supplier photograph instead, with a route back to the
  gallery.

## Known placeholders to confirm before launch

1. Registered business address, phone and grievance officer (used on `/contact` and policies).
2. Return window / warranty term (both policies say “pending confirmation” rather than guessing).
3. Whether a Type-C cable ships in the box.
4. Exact USB-C recess position on the base (models/diagrams label it as unconfirmed).
5. Real freight partner names and any COD reconciliation you intend to support.
