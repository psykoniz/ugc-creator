import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/queue/job-card";
import type { Job, JobStatus } from "@ugc/shared";
import { cn } from "@/lib/utils";

interface QueueColumnProps {
  title: string;
  status: JobStatus;
  jobs: Job[];
}

const statusColors: Record<JobStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  running: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export function QueueColumn({ title, status, jobs }: QueueColumnProps) {
  const filtered = jobs.filter((j) => j.status === status);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <Badge className={cn("text-xs", statusColors[status])} variant="secondary">
          {filtered.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {filtered.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
