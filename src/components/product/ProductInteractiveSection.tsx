"use client";

import { useState } from "react";
import ProductGallery, { type GalleryItem } from "@/components/product/ProductGallery";
import BuyPanel from "@/components/product/BuyPanel";
import { product, type ProductConfig } from "@/lib/config";

export default function ProductInteractiveSection({
  items,
  viewerHref,
  initialProduct,
}: {
  items: GalleryItem[];
  viewerHref: string;
  initialProduct?: ProductConfig;
}) {
  const currentProduct = initialProduct ?? product;
  const [variantId, setVariantId] = useState(
    currentProduct.colorVariants.find((v) => v.inStock)?.id ?? currentProduct.colorVariants[0].id,
  );

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-14">
      <ProductGallery
        items={items}
        viewerHref={viewerHref}
        selectedVariantId={variantId}
        onSelectVariant={setVariantId}
      />
      <BuyPanel variantId={variantId} onVariantChange={setVariantId} productConfig={currentProduct} />
    </div>
  );
}

