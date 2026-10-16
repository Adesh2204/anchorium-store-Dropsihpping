/**
 * Shopify Storefront API client and helper methods.
 *
 * Production-hardened:
 * - Uses supported stable API version 2026-10
 * - Never fabricates fake products, carts, or checkout URLs
 * - Validates real numeric Shopify variant GIDs
 * - Handles GraphQL userErrors and network failures safely
 */

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  price: ShopifyMoney;
  compareAtPrice?: ShopifyMoney | null;
  selectedOptions?: { name: string; value: string }[];
  image?: { url: string; altText?: string | null } | null;
};

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange?: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  } | null;
  variants: ShopifyVariant[];
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: ShopifyMoney;
    product?: {
      title: string;
      handle: string;
    };
    image?: {
      url: string;
    } | null;
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
  };
  lines: ShopifyCartLine[];
};

export type ShopifyUserError = {
  field?: string[];
  message: string;
  code?: string;
};

export type ShopifyCartResult = {
  cart: ShopifyCart | null;
  userErrors: ShopifyUserError[];
  error?: string;
};

export const SHOPIFY_STORE_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  "xuazin-nd.myshopify.com";

const SHOPIFY_STOREFRONT_PUBLIC_TOKEN =
  process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN;

const SHOPIFY_STOREFRONT_PRIVATE_TOKEN =
  process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;

// Supported stable API version
export const API_VERSION =
  process.env.SHOPIFY_STOREFRONT_API_VERSION || "2026-10";

/**
 * Validates whether an ID is an authentic Shopify ProductVariant GID or numeric ID.
 * Rejects placeholder strings (e.g. 'gid://shopify/ProductVariant/auraglow-dark-grey').
 */
export function isValidShopifyVariantId(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  const trimmed = id.trim();
  // Valid format: gid://shopify/ProductVariant/1234567890 or pure numeric string
  return /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(trimmed) || /^\d{8,}$/.test(trimmed);
}

/**
 * Validates that a checkout URL is genuinely hosted on Shopify.
 * Rejects local fallbacks or fabricated paths.
 */
export function isValidShopifyCheckoutUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const isShopifyHost =
      host.endsWith(".myshopify.com") ||
      host.endsWith(".shopify.com") ||
      host === "checkout.shopify.com" ||
      host === SHOPIFY_STORE_DOMAIN.toLowerCase();
    return (
      parsed.protocol === "https:" &&
      isShopifyHost &&
      (parsed.pathname.includes("/checkouts/") ||
        parsed.pathname.includes("/cart/c/") ||
        parsed.pathname.startsWith("/c/"))
    );
  } catch {
    return false;
  }
}

/**
 * Execute a Storefront GraphQL query / mutation.
 */
export async function shopifyStorefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<{ data?: T; errors?: unknown }> {
  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (SHOPIFY_STOREFRONT_PUBLIC_TOKEN) {
    headers["X-Shopify-Storefront-Access-Token"] = SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
  }
  if (SHOPIFY_STOREFRONT_PRIVATE_TOKEN && !SHOPIFY_STOREFRONT_PRIVATE_TOKEN.startsWith("shpat_")) {
    headers["Shopify-Storefront-Private-Token"] = SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`[Shopify Storefront API] HTTP error ${res.status}: ${res.statusText}`);
      return { errors: [{ status: res.status, statusText: res.statusText }] };
    }

    const json = await res.json();
    return json;
  } catch (err) {
    console.warn("[Shopify Storefront API] Network or fetch error:", err);
    return { errors: [err] };
  }
}

/* ------------------------------------------------------------------ *
 * GraphQL queries (Storefront API 2026-10)
 * ------------------------------------------------------------------ */

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

const CART_FIELDS = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                title
                handle
              }
              image {
                url
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FIELDS}
`;

const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FIELDS}
`;

const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FIELDS}
`;

const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FIELDS}
`;

const GET_CART_QUERY = /* GraphQL */ `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
  ${CART_FIELDS}
`;

/* ------------------------------------------------------------------ *
 * Public helper functions
 * ------------------------------------------------------------------ */

function formatRawProduct(raw: any): ShopifyProduct | null {
  if (!raw || !raw.id) return null;
  return {
    id: raw.id,
    title: raw.title,
    handle: raw.handle,
    availableForSale: Boolean(raw.availableForSale),
    priceRange: raw.priceRange,
    compareAtPriceRange: raw.compareAtPriceRange,
    variants: (raw.variants?.edges ?? [])
      .map((e: any) => e.node)
      .filter((v: any) => v && isValidShopifyVariantId(v.id)),
  };
}

function formatRawCart(raw: any): ShopifyCart | null {
  if (!raw || !raw.id || !raw.checkoutUrl) return null;
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity ?? 0,
    cost: raw.cost,
    lines: (raw.lines?.edges ?? []).map((e: any) => e.node),
  };
}

/**
 * Fetch live product information strictly by its configured handle from Shopify.
 * NEVER falls back to arbitrary products in the store.
 * Returns null if the product is not found or connection fails.
 */
export async function getShopifyProduct(handle = "auraglow"): Promise<ShopifyProduct | null> {
  const configuredHandle = (process.env.SHOPIFY_PRODUCT_HANDLE || handle).trim();

  const res = await shopifyStorefrontFetch<{ product: any }>(PRODUCT_BY_HANDLE_QUERY, {
    handle: configuredHandle,
  });

  if (res.data?.product) {
    return formatRawProduct(res.data.product);
  }

  // Strictly return null if product handle was not found
  return null;
}

/**
 * Create a new cart via Shopify Cart API.
 * Validates variant IDs and exposes userErrors. Never returns a fake cart.
 */
export async function createShopifyCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<ShopifyCartResult> {
  // Validate that all lines reference authentic numeric Shopify variant GIDs
  for (const line of lines) {
    if (!isValidShopifyVariantId(line.merchandiseId)) {
      return {
        cart: null,
        userErrors: [
          {
            field: ["lines", "merchandiseId"],
            message: `Invalid or placeholder Shopify variant ID: "${line.merchandiseId}". Must be an authentic numeric GID (e.g. gid://shopify/ProductVariant/1234567890).`,
            code: "INVALID_VARIANT_ID",
          },
        ],
        error: `Invalid or placeholder Shopify variant ID: "${line.merchandiseId}".`,
      };
    }
  }

  const res = await shopifyStorefrontFetch<{
    cartCreate: { cart: any; userErrors: ShopifyUserError[] };
  }>(CART_CREATE_MUTATION, {
    input: {
      lines: lines.map((l) => ({
        merchandiseId: l.merchandiseId,
        quantity: Math.max(1, l.quantity),
      })),
    },
  });

  if (res.errors) {
    const errorMsg = Array.isArray(res.errors)
      ? res.errors.map((e: any) => e?.message || e?.statusText || String(e)).join(", ")
      : "Shopify Storefront API network or request error.";
    return {
      cart: null,
      userErrors: [
        {
          field: ["cartCreate"],
          message: errorMsg,
          code: "NETWORK_ERROR",
        },
      ],
      error: errorMsg,
    };
  }

  const userErrors = res.data?.cartCreate?.userErrors ?? [];
  if (userErrors.length > 0) {
    return {
      cart: null,
      userErrors,
      error: userErrors.map((e) => e.message).join(", "),
    };
  }

  const rawCart = res.data?.cartCreate?.cart;
  const cart = formatRawCart(rawCart);

  if (!cart) {
    return {
      cart: null,
      userErrors: [],
      error: "Shopify Cart API did not return a valid cart or checkout URL.",
    };
  }

  return { cart, userErrors: [] };
}

/**
 * Fetch an existing cart by ID. Returns null if cart does not exist or expired.
 */
export async function getShopifyCart(cartId: string): Promise<ShopifyCart | null> {
  if (!cartId) return null;
  const res = await shopifyStorefrontFetch<{ cart: any }>(GET_CART_QUERY, { cartId });
  return formatRawCart(res.data?.cart);
}

/**
 * Add items to an existing cart. Exposes userErrors.
 */
export async function addLinesToShopifyCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<ShopifyCartResult> {
  for (const line of lines) {
    if (!isValidShopifyVariantId(line.merchandiseId)) {
      return {
        cart: null,
        userErrors: [
          {
            field: ["lines", "merchandiseId"],
            message: `Invalid Shopify variant ID: "${line.merchandiseId}".`,
            code: "INVALID_VARIANT_ID",
          },
        ],
        error: `Invalid Shopify variant ID: "${line.merchandiseId}".`,
      };
    }
  }

  const res = await shopifyStorefrontFetch<{
    cartLinesAdd: { cart: any; userErrors: ShopifyUserError[] };
  }>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: lines.map((l) => ({
      merchandiseId: l.merchandiseId,
      quantity: Math.max(1, l.quantity),
    })),
  });

  if (res.errors) {
    const errorMsg = Array.isArray(res.errors)
      ? res.errors.map((e: any) => e?.message || e?.statusText || String(e)).join(", ")
      : "Shopify Storefront API network or request error.";
    return {
      cart: null,
      userErrors: [{ field: ["cartLinesAdd"], message: errorMsg, code: "NETWORK_ERROR" }],
      error: errorMsg,
    };
  }

  const userErrors = res.data?.cartLinesAdd?.userErrors ?? [];
  if (userErrors.length > 0) {
    return {
      cart: null,
      userErrors,
      error: userErrors.map((e) => e.message).join(", "),
    };
  }

  const cart = formatRawCart(res.data?.cartLinesAdd?.cart);
  return { cart, userErrors: [] };
}

/**
 * Update line quantities in an existing cart.
 */
export async function updateShopifyCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[],
): Promise<ShopifyCartResult> {
  const res = await shopifyStorefrontFetch<{
    cartLinesUpdate: { cart: any; userErrors: ShopifyUserError[] };
  }>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines,
  });

  if (res.errors) {
    const errorMsg = Array.isArray(res.errors)
      ? res.errors.map((e: any) => e?.message || e?.statusText || String(e)).join(", ")
      : "Shopify Storefront API network or request error.";
    return {
      cart: null,
      userErrors: [{ field: ["cartLinesUpdate"], message: errorMsg, code: "NETWORK_ERROR" }],
      error: errorMsg,
    };
  }

  const userErrors = res.data?.cartLinesUpdate?.userErrors ?? [];
  if (userErrors.length > 0) {
    return {
      cart: null,
      userErrors,
      error: userErrors.map((e) => e.message).join(", "),
    };
  }

  const cart = formatRawCart(res.data?.cartLinesUpdate?.cart);
  return { cart, userErrors: [] };
}

/**
 * Remove line items from an existing cart.
 */
export async function removeShopifyCartLines(
  cartId: string,
  lineIds: string[],
): Promise<ShopifyCartResult> {
  const res = await shopifyStorefrontFetch<{
    cartLinesRemove: { cart: any; userErrors: ShopifyUserError[] };
  }>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds,
  });

  if (res.errors) {
    const errorMsg = Array.isArray(res.errors)
      ? res.errors.map((e: any) => e?.message || e?.statusText || String(e)).join(", ")
      : "Shopify Storefront API network or request error.";
    return {
      cart: null,
      userErrors: [{ field: ["cartLinesRemove"], message: errorMsg, code: "NETWORK_ERROR" }],
      error: errorMsg,
    };
  }

  const userErrors = res.data?.cartLinesRemove?.userErrors ?? [];
  if (userErrors.length > 0) {
    return {
      cart: null,
      userErrors,
      error: userErrors.map((e) => e.message).join(", "),
    };
  }

  const cart = formatRawCart(res.data?.cartLinesRemove?.cart);
  return { cart, userErrors: [] };
}

/**
 * Maps store color finish IDs (e.g. "dark-grey", "green", "yellow") to authentic Shopify variant IDs.
 * NEVER returns placeholder or non-numeric IDs.
 * Returns null if no authentic variant can be verified.
 */
export function mapColorToShopifyVariant(
  colorId: string,
  variants?: ShopifyVariant[],
): string | null {
  if (variants && variants.length > 0) {
    const idLower = colorId.toLowerCase();
    const matched = variants.find((v) => {
      if (!isValidShopifyVariantId(v.id)) return false;
      const titleLower = v.title.toLowerCase();
      const options = (v.selectedOptions || []).map((o) => o.value.toLowerCase());
      if (idLower.includes("grey") || idLower.includes("gray")) {
        return (
          titleLower.includes("grey") ||
          titleLower.includes("gray") ||
          options.some((o) => o.includes("grey") || o.includes("gray"))
        );
      }
      if (idLower.includes("green")) {
        return titleLower.includes("green") || options.some((o) => o.includes("green"));
      }
      if (idLower.includes("yellow")) {
        return (
          titleLower.includes("yellow") ||
          titleLower.includes("warm") ||
          options.some((o) => o.includes("yellow") || o.includes("warm"))
        );
      }
      return false;
    });

    if (matched) return matched.id;
  }

  // Check environment variable overrides ONLY if they are authentic numeric GIDs
  const envKey =
    colorId === "dark-grey"
      ? process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_GREY
      : colorId === "green"
      ? process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_GREEN
      : colorId === "yellow"
      ? process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_YELLOW
      : undefined;

  if (envKey && isValidShopifyVariantId(envKey)) {
    return envKey.trim();
  }

  // Return null: never invent a fake variant ID
  return null;
}

/**
 * Verify an order against Shopify if an order reference or token is supplied.
 * Never asserts a fake verified order status.
 */
export async function verifyShopifyOrder(orderRef?: string | null): Promise<{
  verified: boolean;
  orderNumber?: string;
  financialStatus?: string;
  order?: unknown;
  error?: string;
}> {
  if (!orderRef || typeof orderRef !== "string" || orderRef.trim().length === 0) {
    return { verified: false, order: null, error: "No order reference provided." };
  }

  // If Admin API token is configured, we can query the order directly on the server
  if (SHOPIFY_STOREFRONT_PRIVATE_TOKEN && SHOPIFY_STOREFRONT_PRIVATE_TOKEN.startsWith("shpat_")) {
    try {
      const cleanRef = orderRef.replace(/^#/, "").trim();
      const adminUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/orders.json?name=${encodeURIComponent(cleanRef)}&status=any`;
      const res = await fetch(adminUrl, {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const found = data?.orders?.[0];
        if (found) {
          return {
            verified: true,
            orderNumber: found.name || `#${found.order_number}`,
            financialStatus: found.financial_status,
            order: found,
          };
        }
      }
    } catch {
      // Fall through to unverified
    }
  }

  return {
    verified: false,
    order: null,
    error: "Order details must be viewed directly on the official Shopify order status page.",
  };
}
