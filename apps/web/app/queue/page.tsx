"use client";

import Link from "next/link";
import { useSessionState } from "@/hooks/use-session-state";
import { usePoll } from "@/hooks/use-poll";
import { QueueBoard } from "@/components/queue/queue-board";
import { QueueStats } from "@/components/queue/queue-stats";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/shared/error-banner";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";
import type { Job } from "@ugc/shared";

export default function QueuePage() {
  const [experimentId] = useSessionState<string>("experimentId", "");

  const { data, loading, error, refresh } = usePoll<{ jobs: Job[] }>(
    () => api.getJobs(experimentId),
    5000,
    !!experimentId
  );

  if (!experimentId) {
    return <EmptyState message="No experiment found. Please start from the Create step." />;
  }

  const jobs = data?.jobs ?? [];
  const allDone = jobs.length > 0 && jobs.every((j) => j.status === "done" || j.status === "failed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Render Queue</h1>
          <p className="text-sm text-muted-foreground">
            Monitoring jobs for experiment {experimentId.slice(0, 12)}...
            {loading && " (loading...)"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            Refresh
          </Button>
          {allDone && (
            <Button asChild size="sm">
              <Link href="/ranking">View Results</Link>
            </Button>
          )}
        </div>
      </div>

      <ErrorBanner message={error} />
      {jobs.length > 0 && <QueueStats jobs={jobs} />}
      {jobs.length > 0 ? (
        <QueueBoard jobs={jobs} />
      ) : (
        !loading && <EmptyState message="No jobs found." />
      )}
    </div>
  );
}
