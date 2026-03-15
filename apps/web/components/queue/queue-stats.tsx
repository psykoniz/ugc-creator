import type { Job } from "@ugc/shared";

interface QueueStatsProps {
  jobs: Job[];
}

export function QueueStats({ jobs }: QueueStatsProps) {
  const counts = {
    total: jobs.length,
    pending: jobs.filter((j) => j.status === "pending").length,
    running: jobs.filter((j) => j.status === "running").length,
    done: jobs.filter((j) => j.status === "done").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

  return (
    <div className="flex gap-4 text-sm">
      <span>Total: <strong>{counts.total}</strong></span>
      <span className="text-muted-foreground">Pending: {counts.pending}</span>
      <span className="text-blue-600">Running: {counts.running}</span>
      <span className="text-green-600">Done: {counts.done}</span>
      <span className="text-destructive">Failed: {counts.failed}</span>
    </div>
  );
}
