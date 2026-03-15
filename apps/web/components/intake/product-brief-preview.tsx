"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingButton } from "@/components/shared/loading-button";
import { ErrorBanner } from "@/components/shared/error-banner";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useSessionState } from "@/hooks/use-session-state";
import * as api from "@/lib/api";
import type { Product, CreativePack } from "@ugc/shared";

interface ProductBriefPreviewProps {
  product: Product;
}

export function ProductBriefPreview({ product }: ProductBriefPreviewProps) {
  const router = useRouter();
  const { loading, error, execute } = useAsyncAction<CreativePack>();
  const [, setProductId] = useSessionState<string>("productId", "");
  const [, setCreativePackId] = useSessionState<string>("creativePackId", "");
  const [, setCreativePack] = useSessionState<CreativePack | null>("creativePack", null);

  const brief = product.brief;

  const handleCreate = async () => {
    const pack = await execute(() => api.createCreativePack(product.id));
    if (pack) {
      setProductId(product.id);
      setCreativePackId(pack.id);
      setCreativePack(pack);
      router.push("/create");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Product Brief: {brief.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <span className="text-sm font-medium text-muted-foreground">Description</span>
          <p className="text-sm">{brief.description}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground">Target Audience</span>
          <p className="text-sm">{brief.targetAudience}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground">Tone</span>
          <p className="text-sm">{brief.tone}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-muted-foreground">Key Benefits</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {brief.keyBenefits.map((b, i) => (
              <Badge key={i} variant="secondary">{b}</Badge>
            ))}
          </div>
        </div>
        {brief.imageUrls.length > 0 && (
          <div>
            <span className="text-sm font-medium text-muted-foreground">Images</span>
            <p className="text-sm text-muted-foreground">{brief.imageUrls.length} image(s) attached</p>
          </div>
        )}
        <ErrorBanner message={error} />
        <LoadingButton onClick={handleCreate} loading={loading} className="w-full">
          Validate & Create Creative Pack
        </LoadingButton>
      </CardContent>
    </Card>
  );
}
