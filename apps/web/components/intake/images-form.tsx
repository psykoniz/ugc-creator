"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/shared/loading-button";
import { ErrorBanner } from "@/components/shared/error-banner";
import { useAsyncAction } from "@/hooks/use-async-action";
import * as api from "@/lib/api";
import type { Product } from "@ugc/shared";
import { X } from "lucide-react";

interface ImagesFormProps {
  onSuccess: (product: Product) => void;
}

export function ImagesForm({ onSuccess }: ImagesFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const { loading, error, execute } = useAsyncAction<Product>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = imageUrls.filter((u) => u.trim());
    const product = await execute(() =>
      api.ingestImages({ imageUrls: validUrls, name, description })
    );
    if (product) onSuccess(product);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Image URLs</Label>
        {imageUrls.map((url, i) => (
          <div key={i} className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => {
                const next = [...imageUrls];
                next[i] = e.target.value;
                setImageUrls(next);
              }}
              required
            />
            {imageUrls.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setImageUrls([...imageUrls, ""])}>
          Add image URL
        </Button>
      </div>
      <ErrorBanner message={error} />
      <LoadingButton type="submit" loading={loading}>
        Analyze Images
      </LoadingButton>
    </form>
  );
}
