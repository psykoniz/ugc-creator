import { Badge } from "@/components/ui/badge";
import type { Output } from "@ugc/shared";

interface OutputBadgesProps {
  output: Output;
}

export function OutputBadges({ output }: OutputBadgesProps) {
  return (
    <div className="flex gap-1">
      {output.isTopCandidate && (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">TOP</Badge>
      )}
      {output.isWinner && (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">WINNER</Badge>
      )}
    </div>
  );
}
