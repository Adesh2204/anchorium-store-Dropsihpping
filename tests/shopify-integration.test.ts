import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidShopifyVariantId,
  isValidShopifyCheckoutUrl,
  mapColorToShopifyVariant,
  createShopifyCart,
  verifyShopifyOrder,
} from "../src/lib/shopify";
import { product, getVariantShopifyId, getLiveProductConfig } from "../src/lib/config";

test("Shopify Integration & Security Audit Test Suite", async (t) => {
  await t.test("1. Shopify Variant ID Validation & Rejection of Placeholders", () => {
    // Authentic Shopify variant GIDs (must end with numeric ID)
    assert.strictEqual(
      isValidShopifyVariantId("gid://shopify/ProductVariant/45892301829471"),
      true,
      "Valid numeric GID should pass validation"
    );
    assert.strictEqual(
      isValidShopifyVariantId("45892301829471"),
      true,
      "Numeric ID string should pass validation"
    );

    // Placeholder and fake IDs that MUST be rejected
    const invalidIds = [
      "gid://shopify/ProductVariant/auraglow-dark-grey",
      "gid://shopify/ProductVariant/auraglow-moss-green",
      "gid://shopify/ProductVariant/auraglow-sunburst-yellow",
      "gid://shopify/ProductVariant/placeholder",
      "gid://shopify/ProductVariant/abc",
      "fake-id-12345",
      "",
      null,
      undefined,
    ];

    for (const invalidId of invalidIds) {
      assert.strictEqual(
        isValidShopifyVariantId(invalidId),
        false,
        `Placeholder or invalid ID "${invalidId}" MUST be rejected`
      );
    }
  });

  await t.test("2. Verification of All Three Color Variants in Product Config", () => {
    const expectedVariants = ["dark-grey", "green", "yellow"];
    const configuredVariantIds = product.colorVariants.map((v) => v.id);

    // Verify all 3 colors exist in config
    for (const expected of expectedVariants) {
      assert.ok(
        configuredVariantIds.includes(expected),
        `Product configuration must include color variant: ${expected}`
      );
    }
    assert.strictEqual(product.colorVariants.length, 3, "Exactly 3 color variants must be configured");

    // Check that each variant has purchasable and shopifyVariantId fields
    for (const variant of product.colorVariants) {
      assert.ok(
        "purchasable" in variant,
        `Variant ${variant.id} must define explicit purchasable flag`
      );
      assert.ok(
        "shopifyVariantId" in variant,
        `Variant ${variant.id} must define shopifyVariantId field`
      );

      // In the default absence of live numeric Shopify IDs, purchasable must be false
      if (!variant.shopifyVariantId || !isValidShopifyVariantId(variant.shopifyVariantId)) {
        assert.strictEqual(
          variant.purchasable,
          false,
          `Unverified variant ${variant.id} must NOT be marked purchasable`
        );
      }
    }

    // Verify mapColorToShopifyVariant handles all 3 finishes
    const rawGrey = mapColorToShopifyVariant("dark-grey");
    const rawGreen = mapColorToShopifyVariant("moss-green");
    const rawYellow = mapColorToShopifyVariant("sunburst-yellow");

    // Any non-numeric ID from mapColorToShopifyVariant must be filtered to null
    if (rawGrey) assert.ok(isValidShopifyVariantId(rawGrey));
    if (rawGreen) assert.ok(isValidShopifyVariantId(rawGreen));
    if (rawYellow) assert.ok(isValidShopifyVariantId(rawYellow));

    // Non-existent color must return null
    assert.strictEqual(
      mapColorToShopifyVariant("non-existent-color"),
      null,
      "Unknown color must resolve to null"
    );
  });

  await t.test("3. Checkout URL Security & Host Validation", () => {
    // Valid Shopify checkout URLs
    const validUrls = [
      "https://xuazin-nd.myshopify.com/cart/c/c1-1234567890abcdef?key=xyz",
      "https://xuazin-nd.myshopify.com/checkouts/cn/c1-1234567890abcdef",
      "https://checkout.shopify.com/c/c1-1234567890abcdef",
      "https://store.myshopify.com/checkouts/123",
    ];

    for (const url of validUrls) {
      assert.strictEqual(
        isValidShopifyCheckoutUrl(url),
        true,
        `Valid Shopify checkout URL "${url}" should be accepted`
      );
    }

    // Invalid / Fabricated / Malicious checkout URLs that MUST be rejected
    const invalidUrls = [
      "/checkout",
      "/cart/fallback-checkout",
      "https://evil-phishing-site.com/checkout",
      "https://fake-shopify.com/cart",
      "javascript:alert(1)",
      "http://insecure-checkout.com",
      "",
      null,
      undefined,
    ];

    for (const url of invalidUrls) {
      assert.strictEqual(
        isValidShopifyCheckoutUrl(url),
        false,
        `Invalid or untrusted checkout URL "${url}" MUST be rejected`
      );
    }
  });

  await t.test("4. Safe Cart Creation Failure on Invalid/Placeholder Variants", async () => {
    // Attempting to create cart with placeholder or invalid variant ID
    const resultWithInvalidId = await createShopifyCart([
      {
        merchandiseId: "gid://shopify/ProductVariant/auraglow-dark-grey",
        quantity: 1,
      },
    ]);

    // Must fail safely: cart must be null and userErrors must detail the issue
    assert.strictEqual(
      resultWithInvalidId.cart,
      null,
      "Cart must NOT be created with invalid or placeholder variant IDs"
    );
    assert.ok(
      resultWithInvalidId.userErrors.length > 0,
      "userErrors must explain why cart creation failed"
    );
    assert.ok(
      resultWithInvalidId.userErrors.some((err) =>
        err.message.includes("Invalid or placeholder Shopify variant ID")
      ),
      "Error message must specify invalid or placeholder variant ID"
    );
  });

  await t.test("5. Fail-Safe Cart Creation When Storefront API Fails (No Fabricated Carts)", async () => {
    // Attempting to create cart with a syntactically valid ID when store is unreachable / offline
    const result = await createShopifyCart([
      {
        merchandiseId: "gid://shopify/ProductVariant/99999999999999",
        quantity: 1,
      },
    ]);

    // When the network/domain fails, cart must be null, never a fabricated fallback cart session
    assert.strictEqual(
      result.cart,
      null,
      "Cart MUST be null when Shopify API fails; never return fabricated cart"
    );
    assert.ok(
      result.userErrors.length > 0,
      "userErrors must be populated with network or API error"
    );
  });

  await t.test("6. Order Confirmation Security: Rejection of Unauthenticated Order References", async () => {
    // Fabricated references that must NEVER be verified as authentic
    const fakeReferences = [
      "SHOPIFY-random123",
      "ANC-fake-order-99999",
      "random-string-xyz",
      "",
      null as unknown as string,
    ];

    for (const ref of fakeReferences) {
      const verification = await verifyShopifyOrder(ref);
      assert.strictEqual(
        verification.verified,
        false,
        `Fake or unauthenticated order reference "${ref}" must NOT be verified`
      );
      assert.strictEqual(
        verification.order,
        null,
        `Order data must be null for unauthenticated reference "${ref}"`
      );
    }
  });

  await t.test("7. Live Product Config Dynamic Pricing & Inventory Safety", async () => {
    const liveConfig = await getLiveProductConfig();

    assert.ok(liveConfig, "Live product config must return a valid config object");
    assert.strictEqual(liveConfig.colorVariants.length, 3, "Must contain all 3 finishes");

    // If Shopify is unreachable, liveConfig must safely fall back to unpurchasable state
    for (const variant of liveConfig.colorVariants) {
      if (!variant.shopifyVariantId || !isValidShopifyVariantId(variant.shopifyVariantId)) {
        assert.strictEqual(
          variant.purchasable,
          false,
          `Variant ${variant.id} without authentic ID must be unpurchasable in live config`
        );
      }
    }
  });

  await t.test("8. Successful Cart Creation & Response Parsing", async () => {
    // Intercept global fetch for this unit test to simulate authentic Shopify Storefront API 2026-10 response
    const originalFetch = globalThis.fetch;
    try {
      const mockCartResponse = {
        data: {
          cartCreate: {
            cart: {
              id: "gid://shopify/Cart/c1-45892301829471abcd",
              checkoutUrl: "https://xuazin-nd.myshopify.com/cart/c/c1-45892301829471abcd?key=secure123",
              totalQuantity: 2,
              cost: {
                totalAmount: { amount: "7998.0", currencyCode: "INR" },
                subtotalAmount: { amount: "7998.0", currencyCode: "INR" },
              },
              lines: {
                edges: [
                  {
                    node: {
                      id: "gid://shopify/CartLine/1",
                      quantity: 2,
                      merchandise: {
                        id: "gid://shopify/ProductVariant/45892301829471",
                        title: "Dark Grey",
                        price: { amount: "3999.0", currencyCode: "INR" },
                      },
                    },
                  },
                ],
              },
            },
            userErrors: [],
          },
        },
      };

      globalThis.fetch = async () =>
        new Response(JSON.stringify(mockCartResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });

      const result = await createShopifyCart([
        {
          merchandiseId: "gid://shopify/ProductVariant/45892301829471",
          quantity: 2,
        },
      ]);

      assert.ok(result.cart, "Cart must be created successfully when Shopify returns valid data");
      assert.strictEqual(result.cart.id, "gid://shopify/Cart/c1-45892301829471abcd");
      assert.strictEqual(result.cart.totalQuantity, 2);
      assert.strictEqual(result.userErrors.length, 0);
      assert.ok(isValidShopifyCheckoutUrl(result.cart.checkoutUrl));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await t.test("9. Accurate Handling of Shopify GraphQL userErrors", async () => {
    const originalFetch = globalThis.fetch;
    try {
      const mockUserErrorResponse = {
        data: {
          cartCreate: {
            cart: null,
            userErrors: [
              {
                field: ["lines", "0", "merchandiseId"],
                message: "The selected variant is out of stock.",
                code: "OUT_OF_STOCK",
              },
            ],
          },
        },
      };

      globalThis.fetch = async () =>
        new Response(JSON.stringify(mockUserErrorResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });

      const result = await createShopifyCart([
        {
          merchandiseId: "gid://shopify/ProductVariant/45892301829471",
          quantity: 1,
        },
      ]);

      assert.strictEqual(result.cart, null, "Cart must be null when userErrors are returned");
      assert.strictEqual(result.userErrors.length, 1);
      assert.strictEqual(result.userErrors[0].code, "OUT_OF_STOCK");
      assert.strictEqual(result.userErrors[0].message, "The selected variant is out of stock.");
      assert.ok(result.error?.includes("out of stock"));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

