"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingButton } from "@/components/shared/loading-button";
import { ErrorBanner } from "@/components/shared/error-banner";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useSessionState } from "@/hooks/use-session-state";
import * as api from "@/lib/api";
import type { CreativePackResponse } from "@/lib/api";
import type { ProductBrief, CreativePack, Hook, Script } from "@ugc/shared";

interface ProductBriefPreviewProps {
  productId: string;
  brief: ProductBrief;
}

export function ProductBriefPreview({ productId, brief }: ProductBriefPreviewProps) {
  const router = useRouter();
  const { loading, error, execute } = useAsyncAction<CreativePackResponse>();
  const [, setProductId] = useSessionState<string>("productId", "");
  const [, setCreativePackId] = useSessionState<string>("creativePackId", "");
  const [, setCreativePack] = useSessionState<CreativePack | null>("creativePack", null);
  const [, setHooks] = useSessionState<Hook[]>("hooks", []);
  const [, setScripts] = useSessionState<Script[]>("scripts", []);

  const handleCreate = async () => {
    const result = await execute(() => api.createCreativePack(productId));
    if (result) {
      setProductId(productId);
      setCreativePackId(result.creative_pack.id);
      setCreativePack(result.creative_pack);
      setHooks(result.hooks);
      setScripts(result.scripts);
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
