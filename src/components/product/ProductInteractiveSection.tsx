"use client";

import { useState } from "react";
import ProductGallery, { type GalleryItem } from "@/components/product/ProductGallery";
import BuyPanel from "@/components/product/BuyPanel";
import { product } from "@/lib/config";

export default function ProductInteractiveSection({
  items,
  viewerHref,
}: {
  items: GalleryItem[];
  viewerHref: string;
}) {
  const [variantId, setVariantId] = useState(
    product.colorVariants.find((v) => v.inStock)?.id ?? product.colorVariants[0].id,
  );

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-14">
      <ProductGallery
        items={items}
        viewerHref={viewerHref}
        selectedVariantId={variantId}
        onSelectVariant={setVariantId}
      />
      <BuyPanel variantId={variantId} onVariantChange={setVariantId} />
    </div>
  );
}

