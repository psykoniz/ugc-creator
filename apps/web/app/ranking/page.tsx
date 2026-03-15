"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSessionState } from "@/hooks/use-session-state";
import { useAsyncAction } from "@/hooks/use-async-action";
import { RankingTable } from "@/components/ranking/ranking-table";
import { VideoPlayerModal } from "@/components/ranking/video-player-modal";
import { VideoCompareModal } from "@/components/ranking/video-compare-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/shared/error-banner";
import { LoadingButton } from "@/components/shared/loading-button";
import * as api from "@/lib/api";
import type { Output, Rating, Script, Job } from "@ugc/shared";

interface RankedOutput extends Output {
  rating?: Rating;
  rank: number;
}

export default function RankingPage() {
  const [experimentId] = useSessionState<string>("experimentId", "");
  const [scripts] = useSessionState<Script[]>("scripts", []);
  const [outputs, setOutputs] = useState<RankedOutput[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [compareOutputs, setCompareOutputs] = useState<[RankedOutput, RankedOutput] | null>(null);
  const [loadingOutputs, setLoadingOutputs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rateAction = useAsyncAction();

  // Build lookup: jobId → scriptId, then scriptId → Script
  const scriptByJobId = useMemo(() => {
    const jobMap = new Map(jobs.map((j) => [j.id, j.scriptId]));
    const scriptMap = new Map(scripts.map((s) => [s.id, s]));
    const result = new Map<string, Script>();
    for (const [jobId, scriptId] of jobMap) {
      const script = scriptMap.get(scriptId);
      if (script) result.set(jobId, script);
    }
    return result;
  }, [jobs, scripts]);

  const fetchOutputs = useCallback(async () => {
    if (!experimentId) return;
    try {
      setLoadingOutputs(true);
      const [outputsRes, jobsRes] = await Promise.all([
        api.getOutputs(experimentId),
        api.getJobs(experimentId),
      ]);
      setJobs(jobsRes.jobs);
      const ranked = outputsRes.outputs
        .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0))
        .map((o, i) => ({ ...o, rank: i + 1 }));
      setOutputs(ranked);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load outputs");
    } finally {
      setLoadingOutputs(false);
    }
  }, [experimentId]);

  useEffect(() => {
    fetchOutputs();
  }, [fetchOutputs]);

  const handleRate = async () => {
    const outputIds = outputs.map((o) => o.id);
    await rateAction.execute(() => api.batchRate(outputIds));
    await fetchOutputs();
  };

  const handleCompare = (a: RankedOutput, b: RankedOutput) => {
    setCompareOutputs([a, b]);
  };

  if (!experimentId) {
    return <EmptyState message="No experiment found. Please start from the Create step." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ranking Board</h1>
          <p className="text-sm text-muted-foreground">
            Review and score outputs for experiment {experimentId.slice(0, 12)}...
          </p>
        </div>
        <div className="flex gap-2">
          <LoadingButton
            variant="outline"
            size="sm"
            loading={rateAction.loading}
            onClick={handleRate}
            disabled={outputs.length === 0}
          >
            Rate All
          </LoadingButton>
          <LoadingButton
            variant="outline"
            size="sm"
            loading={loadingOutputs}
            onClick={fetchOutputs}
          >
            Refresh
          </LoadingButton>
        </div>
      </div>

      <ErrorBanner message={error || rateAction.error} />

      {outputs.length > 0 ? (
        <RankingTable
          outputs={outputs}
          scriptByJobId={scriptByJobId}
          onPlay={setVideoUrl}
          onCompare={handleCompare}
          onRefresh={fetchOutputs}
        />
      ) : (
        !loadingOutputs && <EmptyState message="No outputs found." />
      )}

      <VideoPlayerModal url={videoUrl} onClose={() => setVideoUrl(null)} />
      <VideoCompareModal
        outputs={compareOutputs}
        onClose={() => setCompareOutputs(null)}
      />
    </div>
  );
}
