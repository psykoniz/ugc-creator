"use client";

import { useState } from "react";
import type { IngestSource } from "@ugc/shared";
import type { IngestResponse } from "@/lib/api";
import { SourceSelector } from "@/components/intake/source-selector";
import { UrlForm } from "@/components/intake/url-form";
import { ImagesForm } from "@/components/intake/images-form";
import { PromptForm } from "@/components/intake/prompt-form";
import { ProductBriefPreview } from "@/components/intake/product-brief-preview";

export default function IntakePage() {
  const [sourceType, setSourceType] = useState<IngestSource>("url");
  const [ingestResult, setIngestResult] = useState<IngestResponse | null>(null);

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
        {sourceType === "url" && <UrlForm onSuccess={setIngestResult} />}
        {sourceType === "images" && <ImagesForm onSuccess={setIngestResult} />}
        {sourceType === "prompt" && <PromptForm onSuccess={setIngestResult} />}
      </div>

      {ingestResult && (
        <div className="max-w-xl">
          <ProductBriefPreview
            productId={ingestResult.product_id}
            brief={ingestResult.product_brief}
          />
        </div>
      )}
    </div>
  );
}
