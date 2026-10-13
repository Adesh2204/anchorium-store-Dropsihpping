import { shipping, site } from "./config";

/**
 * Policy content is deliberately written as an editable template: no invented
 * warranty length, return window, GSTIN, address or guarantee. Swap the strings
 * once the business has confirmed its real terms.
 */

export type PolicyDoc = {
  slug: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

const pending = "Pending business confirmation.";

export const policies: Record<string, PolicyDoc> = {
  shipping: {
    slug: "shipping-policy",
    title: "Shipping policy",
    intro:
      "How AuraGlow orders move, what they cost to ship, and what we will not promise before the courier has the parcel.",
    sections: [
      {
        heading: "Dispatch",
        body: [
          `Orders are placed against live supplier stock at origin. ${shipping.dispatchNote} You get a dispatch email with the courier reference once the parcel is physically handed over.`,
          "We do not publish a dispatch SLA in hours, because fulfilment depends on the supplier's warehouse queue and it would not be honest to promise one.",
        ],
      },
      {
        heading: "Standard Insured Delivery: 10–14 business days",
        body: [
          `Standard Insured Delivery: ${shipping.estimate.minBusinessDays}–${shipping.estimate.maxBusinessDays} business days across India after dispatch.`,
          "Every order is fully insured against transit loss or damage from warehouse departure until it reaches your doorstep.",
          `The standard ₹${(shipping.standardPaise / 100).toFixed(0)} shipping charge is waived — you receive free delivery on your first order.`,
          "Business days exclude Sundays, Saturdays and Indian public holidays; remote PIN codes can add a day or two at the courier's discretion.",
        ],
      },
      {
        heading: "100% Prepaid premium product — No COD",
        body: [
          shipping.codAvailable
            ? "COD is enabled and collected at the door by the courier."
            : "We market and handle the AuraGlow lamp as a 100% Prepaid premium product. Cash on Delivery (COD) is strictly disabled to ensure direct transit insurance, priority warehouse queueing, and frictionless dispatch.",
          "Payments are processed securely via UPI (Google Pay, PhonePe, Paytm, BHIM), Cards (Visa, Mastercard, RuPay, Amex), and Net Banking via our encrypted gateway.",
        ],
      },
      {
        heading: "Tracking and delivery attempts",
        body: [
          "Every shipment is tracked. The courier makes the attempts standard for your PIN code; if a delivery fails, the parcel is returned to us and we contact you for re-delivery or a refund of the item price.",
          "Please be reachable on the mobile number given at checkout — that is where delivery OTP and address queries arrive.",
        ],
      },
      {
        heading: "Damages in transit",
        body: [
          "Note the external condition at delivery, photograph any crushed box or cracked cover within 24 hours of receiving it, and write to us with the order reference. We evaluate each case on the evidence rather than on a fixed rule.",
        ],
      },
      {
        heading: "Serviceable areas",
        body: [
          "We ship to PIN codes serviceable by our courier partner inside India. No international shipping at present.",
        ],
      },
    ],
  },

  returns: {
    slug: "returns-refunds",
    title: "Returns & refunds",
    intro:
      "Plainly stated: our return window is not fixed yet. Here is what happens today, and what will be published once confirmed.",
    sections: [
      {
        heading: "Current position",
        body: [
          `${pending} Until then we do not print a "7-day" or "30-day" promise we may not be able to keep.`,
          "What we do commit to now: if your lamp arrives damaged, incorrect or missing parts, send photos and the order reference and we will confirm a remedy in writing — replacement, partial credit or refund of the item price.",
        ],
      },
      {
        heading: "Items eligible for a claim",
        body: [
          "Transit damage to the transparent cover or base.",
          "A non-functioning unit on first use (does not power on, filament dark, touch control unresponsive, charging fault).",
          "A wrong finish or wrong item delivered.",
        ],
      },
      {
        heading: "Not covered",
        body: [
          "Cosmetic wear after use, drops, or a bent filament that has been forced past its natural flex.",
          "Liquid exposure: the lamp is rated IP20 and is not waterproof.",
          "Changed mind returns, until the business confirms a window.",
        ],
      },
      {
        heading: "How to raise it",
        body: [
          `Use the ${site.brand} contact form, choose “Damaged or wrong item”, and include your ANC reference plus photos. We reply with the agreed remedy and, where a return is needed, the courier arrangement.`,
        ],
      },
      {
        heading: "Refund mechanics",
        body: [
          "Approved refunds go back to the original payment method through the gateway. Gateway and bank settlement timelines typically add a few working days after we release the refund.",
          "Shipping charges are refunded only when the return is our error (wrong or damaged item).",
        ],
      },
    ],
  },

  privacy: {
    slug: "privacy-policy",
    title: "Privacy policy",
    intro: "What this store collects, why it exists in our database, and who else ever sees it.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "At checkout: name, mobile number, email, delivery address, city, state and PIN code, plus the order lines and amounts.",
          "In support messages: name, email, optional phone, optional order reference and the message text.",
          "Nothing else: no advertising pixels, no third-party trackers, no cookies beyond the cart stored locally in your own browser.",
        ],
      },
      {
        heading: "Why we collect it",
        body: [
          "To create the order, price it, take payment through the configured gateway, hand the parcel to a courier and answer you when you write.",
          "Your address is never used for marketing without a separate opt-in.",
        ],
      },
      {
        heading: "Payments",
        body: [
          "Card, UPI, net-banking and wallet details are handled by the payment gateway. ${site.brand} never receives or stores your card number, CVV, UPI PIN or bank credentials.",
          "We store only the gateway order id, payment id and the fact that the signature verified.",
        ],
      },
      {
        heading: "Storage and access",
        body: [
          "Orders and support messages live in this store's own PostgreSQL database. Access is limited to the people operating the store and to the hosting provider's staff under their infrastructure terms.",
          "Under the Digital Personal Data Protection Act, 2023 you may request access, correction or erasure of your data by writing to us.",
        ],
      },
      {
        heading: "Retention",
        body: [
          "Order records are kept while they are legally required to be kept for accounting and dispute purposes; support threads are kept for a year and then removed unless a dispute is open.",
        ],
      },
      {
        heading: "Grievance contact",
        body: [
          `${pending} An Indian e-commerce store must publish a grievance officer name and contact; insert it here (and in src/lib/config.ts) before launch.`,
        ],
      },
    ],
  },

  terms: {
    slug: "terms-and-conditions",
    title: "Terms & conditions",
    intro: "The rules of buying from this store, stated as plainly as we can.",
    sections: [
      {
        heading: "The offer",
        body: [
          "AuraGlow is sold as a single-product store listing. Prices are in Indian Rupees and include applicable taxes. Promotional pricing (currently the Diwali Glow Sale at ₹3,999 after ₹1,000 off the ₹4,999 reference price, with free delivery on your first order) runs for the configured window shown on the site and is not extended retroactively.",
          "Product descriptions, specifications and dimensions are transcribed from the supplier listing. If the supplier changes the physical article, the listing changes with it.",
        ],
      },
      {
        heading: "Orders and pricing",
        body: [
          "An order is created when we persist it and, where a gateway is live, when payment is verified by our server. An order that has not been verified is never described as paid.",
          "We may cancel and refund an order if stock at origin proves unavailable, if the delivery address cannot be serviced, or if payment cannot be verified.",
        ],
      },
      {
        heading: "What the lamp is — and is not",
        body: [
          "It is an ambient accent light rated 6LM – 60LM (3-level dimming + breathing mode) at 2700K Warm Yellow, IP20 for indoor use, with a 1,500 mAh Type-C rechargeable cell (6–16h battery life) and a flexible suspended filament.",
          "It is not a room light, not a task light, not waterproof, and not rated for wet outdoor use. Any supplier marketing language suggesting otherwise is not repeated by us.",
        ],
      },
      {
        heading: "3D model and imagery",
        body: [
          "Photography marked “Authentic supplier photograph” is the supplier's own image of the item. Frames marked “Brand visualisation” are art-directed renders of the same product for context only. The downloadable .glb is a photographic reconstruction built to the listed dimensions — it is not a 3D scan and does not control your physical lamp.",
        ],
      },
      {
        heading: "Warranty",
        body: [
          `${pending} The supplier listing does not publish a warranty term, so we do not invent one. When a manufacturer or store warranty is confirmed it will be stated here with its duration and scope.`,
        ],
      },
      {
        heading: "Acceptable use of this site",
        body: [
          "Do not attempt to place orders with fabricated delivery details, probe the checkout endpoints, or scrape the imagery and 3D assets for resale listings. The brand artwork is for this store.",
        ],
      },
      {
        heading: "Law",
        body: [
          "These terms are governed by the laws of India. Jurisdiction follows the registered business address once it is published in this document.",
        ],
      },
    ],
  },
};

export const policyList = Object.values(policies).map((p) => ({ title: p.title, href: `/${p.slug}` }));
