"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OutputBadges } from "@/components/ranking/output-badges";
import { ScoreBreakdown } from "@/components/ranking/score-breakdown";
import { MutationPicker } from "@/components/ranking/mutation-picker";
import { WinnerActions } from "@/components/ranking/winner-actions";
import { ScriptPreviewModal } from "@/components/ranking/script-preview-modal";
import type { Output, Rating, Script } from "@ugc/shared";
import { Play, FileText, GitCompare } from "lucide-react";

interface RankedOutput extends Output {
  rating?: Rating;
  rank: number;
}

interface RankingTableProps {
  outputs: RankedOutput[];
  scriptByJobId: Map<string, Script>;
  onPlay: (url: string) => void;
  onCompare: (a: RankedOutput, b: RankedOutput) => void;
  onRefresh: () => void;
}

export function RankingTable({ outputs, scriptByJobId, onPlay, onCompare, onRefresh }: RankingTableProps) {
  const [previewScript, setPreviewScript] = useState<Script | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 2) {
        next.add(id);
      }
      return next;
    });
  };

  const handleCompare = () => {
    const ids = Array.from(selected);
    if (ids.length === 2) {
      const a = outputs.find((o) => o.id === ids[0]);
      const b = outputs.find((o) => o.id === ids[1]);
      if (a && b) {
        onCompare(a, b);
        setSelected(new Set());
      }
    }
  };

  return (
    <>
      {selected.size === 2 && (
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={handleCompare}>
            <GitCompare className="h-4 w-4 mr-1" />
            Compare selected
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead className="w-12">#</TableHead>
            <TableHead className="w-12" />
            <TableHead>Script</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Breakdown</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mutate</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {outputs.map((output) => {
            const script = scriptByJobId.get(output.jobId);
            return (
              <TableRow key={output.id} className={selected.has(output.id) ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(output.id)}
                    onCheckedChange={() => toggleSelect(output.id)}
                    disabled={!selected.has(output.id) && selected.size >= 2}
                  />
                </TableCell>
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
                <TableCell>
                  {script ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 max-w-[200px] truncate text-xs"
                      onClick={() => setPreviewScript(script)}
                    >
                      <FileText className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate">{script.body.slice(0, 50)}...</span>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
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
                  <MutationPicker scriptId={script?.id ?? output.jobId} />
                </TableCell>
                <TableCell>
                  <WinnerActions
                    outputId={output.id}
                    isWinner={output.isWinner}
                    onMarked={onRefresh}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <ScriptPreviewModal script={previewScript} onClose={() => setPreviewScript(null)} />
    </>
  );
}
