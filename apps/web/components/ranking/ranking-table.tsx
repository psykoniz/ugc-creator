"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { OutputBadges } from "@/components/ranking/output-badges";
import { ScoreBreakdown } from "@/components/ranking/score-breakdown";
import { MutationPicker } from "@/components/ranking/mutation-picker";
import { WinnerActions } from "@/components/ranking/winner-actions";
import type { Output, Rating } from "@ugc/shared";
import { Play } from "lucide-react";

interface RankedOutput extends Output {
  rating?: Rating;
  rank: number;
}

interface RankingTableProps {
  outputs: RankedOutput[];
  onPlay: (url: string) => void;
  onRefresh: () => void;
}

export function RankingTable({ outputs, onPlay, onRefresh }: RankingTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead className="w-12" />
          <TableHead>Duration</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Breakdown</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Mutate</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {outputs.map((output) => (
          <TableRow key={output.id}>
            <TableCell className="font-medium">{output.rank}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPlay(output.videoUrl)}
              >
                <Play className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell className="text-sm">
              {output.duration ? `${output.duration.toFixed(1)}s` : "-"}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {output.finalScore != null
                ? `${Math.round(output.finalScore * 100)}%`
                : "-"}
            </TableCell>
            <TableCell>
              {output.rating ? (
                <ScoreBreakdown
                  heuristicScore={output.rating.heuristicScore}
                  llmScore={output.rating.llmScore}
                  businessScore={output.rating.businessScore}
                />
              ) : (
                <span className="text-xs text-muted-foreground">Not rated</span>
              )}
            </TableCell>
            <TableCell>
              <OutputBadges output={output} />
            </TableCell>
            <TableCell>
              <MutationPicker scriptId={output.jobId} />
            </TableCell>
            <TableCell>
              <WinnerActions
                outputId={output.id}
                isWinner={output.isWinner}
                onMarked={onRefresh}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
