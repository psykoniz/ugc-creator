import { QueueColumn } from "@/components/queue/queue-column";
import type { Job } from "@ugc/shared";

interface QueueBoardProps {
  jobs: Job[];
}

export function QueueBoard({ jobs }: QueueBoardProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <QueueColumn title="Pending" status="pending" jobs={jobs} />
      <QueueColumn title="Running" status="running" jobs={jobs} />
      <QueueColumn title="Done" status="done" jobs={jobs} />
      <QueueColumn title="Failed" status="failed" jobs={jobs} />
    </div>
  );
}
