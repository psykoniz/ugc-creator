"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Output, Rating } from "@ugc/shared";

interface RankedOutput extends Output {
  rating?: Rating;
  rank: number;
}

interface VideoCompareModalProps {
  outputs: [RankedOutput, RankedOutput] | null;
  onClose: () => void;
}

export function VideoCompareModal({ outputs, onClose }: VideoCompareModalProps) {
  return (
    <Dialog open={!!outputs} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Compare Outputs</DialogTitle>
        </DialogHeader>
        {outputs && (
          <div className="grid grid-cols-2 gap-4">
            {outputs.map((output) => (
              <div key={output.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Rank #{output.rank}</span>
                  <span className="font-mono">
                    {output.finalScore != null
                      ? `${Math.round(output.finalScore * 100)}%`
                      : "Not scored"}
                  </span>
                </div>
                <video
                  src={output.videoUrl}
                  controls
                  className="w-full rounded-md aspect-[9/16] object-cover bg-black"
                />
                {output.rating && (
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>Heuristic: {Math.round(output.rating.heuristicScore * 100)}%</div>
                    <div>LLM: {Math.round(output.rating.llmScore * 100)}%</div>
                    <div>Business: {Math.round(output.rating.businessScore * 100)}%</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
