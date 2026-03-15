"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/shared/loading-button";
import { ErrorBanner } from "@/components/shared/error-banner";
import { useAsyncAction } from "@/hooks/use-async-action";
import * as api from "@/lib/api";
import type { Product } from "@ugc/shared";
import { X } from "lucide-react";

interface PromptFormProps {
  onSuccess: (product: Product) => void;
}

export function PromptForm({ onSuccess }: PromptFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("");
  const [keyBenefits, setKeyBenefits] = useState<string[]>([""]);
  const { loading, error, execute } = useAsyncAction<Product>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validBenefits = keyBenefits.filter((b) => b.trim());
    const product = await execute(() =>
      api.ingestPrompt({ name, description, targetAudience, tone, keyBenefits: validBenefits })
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
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="audience">Target Audience</Label>
        <Input id="audience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tone">Tone</Label>
        <Input id="tone" value={tone} onChange={(e) => setTone(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Key Benefits</Label>
        {keyBenefits.map((benefit, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="e.g., saves time"
              value={benefit}
              onChange={(e) => {
                const next = [...keyBenefits];
                next[i] = e.target.value;
                setKeyBenefits(next);
              }}
              required
            />
            {keyBenefits.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setKeyBenefits(keyBenefits.filter((_, j) => j !== i))}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setKeyBenefits([...keyBenefits, ""])}>
          Add benefit
        </Button>
      </div>
      <ErrorBanner message={error} />
      <LoadingButton type="submit" loading={loading}>
        Create from Prompt
      </LoadingButton>
    </form>
  );
}
