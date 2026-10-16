/**
 * Shopify Storefront API client and helper methods.
 *
 * Handles fetching live product prices & stock, creating/managing Storefront carts,
 * and generating secure checkout URLs for Shopify Checkout.
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

const SHOPIFY_STORE_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  "xuazin-nd.myshopify.com";

const SHOPIFY_STOREFRONT_PUBLIC_TOKEN =
  process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN ||
  "a8469e5a89701c03684ff17a26a35f86";

const SHOPIFY_STOREFRONT_PRIVATE_TOKEN =
  process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;

const API_VERSION =
  process.env.SHOPIFY_STOREFRONT_API_VERSION || "2024-10";

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
      next: { revalidate: 60 }, // Cache on server for 60 seconds
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
 * GraphQL queries
 * ------------------------------------------------------------------ */

const PRODUCT_QUERY = /* GraphQL */ `
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

const FIRST_PRODUCT_QUERY = /* GraphQL */ `
  query getFirstProduct {
    products(first: 1) {
      edges {
        node {
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
  if (!raw) return null;
  return {
    id: raw.id,
    title: raw.title,
    handle: raw.handle,
    availableForSale: Boolean(raw.availableForSale),
    priceRange: raw.priceRange,
    compareAtPriceRange: raw.compareAtPriceRange,
    variants: (raw.variants?.edges ?? []).map((e: any) => e.node),
  };
}

function formatRawCart(raw: any): ShopifyCart | null {
  if (!raw) return null;
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity ?? 0,
    cost: raw.cost,
    lines: (raw.lines?.edges ?? []).map((e: any) => e.node),
  };
}

/**
 * Fetch live product information by handle from Shopify.
 * If handle is not found, falls back to the first available product.
 */
export async function getShopifyProduct(handle = "auraglow"): Promise<ShopifyProduct | null> {
  const configuredHandle = process.env.SHOPIFY_PRODUCT_HANDLE || handle;

  // Try handle query
  const res = await shopifyStorefrontFetch<{ product: any }>(PRODUCT_QUERY, {
    handle: configuredHandle,
  });

  if (res.data?.product) {
    return formatRawProduct(res.data.product);
  }

  // Fallback to first product in store
  const firstRes = await shopifyStorefrontFetch<{ products: { edges: { node: any }[] } }>(
    FIRST_PRODUCT_QUERY,
  );

  const firstNode = firstRes.data?.products?.edges?.[0]?.node;
  if (firstNode) {
    return formatRawProduct(firstNode);
  }

  return null;
}

/**
 * Create a new cart via Shopify Cart API.
 */
export async function createShopifyCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<ShopifyCart | null> {
  const res = await shopifyStorefrontFetch<{
    cartCreate: { cart: any; userErrors: { field: string[]; message: string }[] };
  }>(CART_CREATE_MUTATION, {
    input: {
      lines: lines.map((l) => ({
        merchandiseId: l.merchandiseId,
        quantity: l.quantity,
      })),
    },
  });

  const cart = res.data?.cartCreate?.cart;
  return formatRawCart(cart);
}

/**
 * Fetch an existing cart by ID.
 */
export async function getShopifyCart(cartId: string): Promise<ShopifyCart | null> {
  if (!cartId) return null;
  const res = await shopifyStorefrontFetch<{ cart: any }>(GET_CART_QUERY, { cartId });
  return formatRawCart(res.data?.cart);
}

/**
 * Add items to an existing cart.
 */
export async function addLinesToShopifyCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<ShopifyCart | null> {
  const res = await shopifyStorefrontFetch<{
    cartLinesAdd: { cart: any; userErrors: { field: string[]; message: string }[] };
  }>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: lines.map((l) => ({
      merchandiseId: l.merchandiseId,
      quantity: l.quantity,
    })),
  });

  return formatRawCart(res.data?.cartLinesAdd?.cart);
}

/**
 * Update line quantities in an existing cart.
 */
export async function updateShopifyCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[],
): Promise<ShopifyCart | null> {
  const res = await shopifyStorefrontFetch<{
    cartLinesUpdate: { cart: any; userErrors: { field: string[]; message: string }[] };
  }>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines,
  });

  return formatRawCart(res.data?.cartLinesUpdate?.cart);
}

/**
 * Remove line items from an existing cart.
 */
export async function removeShopifyCartLines(
  cartId: string,
  lineIds: string[],
): Promise<ShopifyCart | null> {
  const res = await shopifyStorefrontFetch<{
    cartLinesRemove: { cart: any; userErrors: { field: string[]; message: string }[] };
  }>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds,
  });

  return formatRawCart(res.data?.cartLinesRemove?.cart);
}

/**
 * Maps store color finish IDs (e.g. "dark-grey", "green", "yellow") to Shopify variant IDs.
 */
export function mapColorToShopifyVariant(
  colorId: string,
  variants?: ShopifyVariant[],
): string {
  if (variants && variants.length > 0) {
    const idLower = colorId.toLowerCase();
    const matched = variants.find((v) => {
      const titleLower = v.title.toLowerCase();
      const options = (v.selectedOptions || []).map((o) => o.value.toLowerCase());
      if (idLower.includes("grey") || idLower.includes("gray")) {
        return titleLower.includes("grey") || titleLower.includes("gray") || options.some((o) => o.includes("grey") || o.includes("gray"));
      }
      if (idLower.includes("green")) {
        return titleLower.includes("green") || options.some((o) => o.includes("green"));
      }
      if (idLower.includes("yellow")) {
        return titleLower.includes("yellow") || titleLower.includes("warm") || options.some((o) => o.includes("yellow") || o.includes("warm"));
      }
      return false;
    });

    if (matched) return matched.id;
  }

  // Fallback variant mapping or env override
  if (colorId === "dark-grey") {
    return process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_GREY || "gid://shopify/ProductVariant/auraglow-dark-grey";
  }
  if (colorId === "green") {
    return process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_GREEN || "gid://shopify/ProductVariant/auraglow-green";
  }
  if (colorId === "yellow") {
    return process.env.NEXT_PUBLIC_SHOPIFY_VARIANT_YELLOW || "gid://shopify/ProductVariant/auraglow-yellow";
  }

  return variants?.[0]?.id || `gid://shopify/ProductVariant/${colorId}`;
}

