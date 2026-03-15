"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LoadingButton } from "@/components/shared/loading-button";
import { useAsyncAction } from "@/hooks/use-async-action";
import * as api from "@/lib/api";
import type { Job } from "@ugc/shared";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const { loading, execute } = useAsyncAction<Job>();

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await execute(() => api.retryJob(job.id));
  };

  return (
    <Card>
      <CardContent className="p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            {job.id.slice(0, 12)}
          </span>
          {job.status === "running" && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Script: {job.scriptId.slice(0, 12)}
        </p>
        <p className="text-xs text-muted-foreground">Provider: {job.provider}</p>
        {job.retryCount > 0 && (
          <p className="text-xs text-muted-foreground">Retries: {job.retryCount}</p>
        )}
        {job.error && (
          <p className="mt-1 text-xs text-destructive">{job.error}</p>
        )}
        {job.status === "failed" && (
          <LoadingButton
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            loading={loading}
            onClick={handleRetry}
          >
            Retry
          </LoadingButton>
        )}
      </CardContent>
    </Card>
  );
}
