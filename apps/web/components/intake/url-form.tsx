"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/shared/loading-button";
import { ErrorBanner } from "@/components/shared/error-banner";
import { useAsyncAction } from "@/hooks/use-async-action";
import * as api from "@/lib/api";
import type { Product } from "@ugc/shared";

interface UrlFormProps {
  onSuccess: (product: Product) => void;
}

export function UrlForm({ onSuccess }: UrlFormProps) {
  const [url, setUrl] = useState("");
  const { loading, error, execute } = useAsyncAction<Product>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = await execute(() => api.ingestUrl(url));
    if (product) onSuccess(product);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Product URL</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com/product"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>
      <ErrorBanner message={error} />
      <LoadingButton type="submit" loading={loading}>
        Analyze URL
      </LoadingButton>
    </form>
  );
}
