"use client";

import { useState } from "react";
import type { Product, IngestSource } from "@ugc/shared";
import { SourceSelector } from "@/components/intake/source-selector";
import { UrlForm } from "@/components/intake/url-form";
import { ImagesForm } from "@/components/intake/images-form";
import { PromptForm } from "@/components/intake/prompt-form";
import { ProductBriefPreview } from "@/components/intake/product-brief-preview";

export default function IntakePage() {
  const [sourceType, setSourceType] = useState<IngestSource>("url");
  const [product, setProduct] = useState<Product | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Product Intake</h1>
        <p className="text-sm text-muted-foreground">
          Import a product to generate UGC creative assets.
        </p>
      </div>

      <SourceSelector value={sourceType} onChange={setSourceType} />

      <div className="max-w-xl">
        {sourceType === "url" && <UrlForm onSuccess={setProduct} />}
        {sourceType === "images" && <ImagesForm onSuccess={setProduct} />}
        {sourceType === "prompt" && <PromptForm onSuccess={setProduct} />}
      </div>

      {product && (
        <div className="max-w-xl">
          <ProductBriefPreview product={product} />
        </div>
      )}
    </div>
  );
}
