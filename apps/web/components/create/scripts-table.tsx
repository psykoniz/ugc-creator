"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Script } from "@ugc/shared";
import { MAX_RENDERS_PER_BATCH } from "@ugc/shared";

interface ScriptsTableProps {
  scripts: Script[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export function ScriptsTable({ scripts, selectedIds, onToggle }: ScriptsTableProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Scripts</h3>
        <span className="text-sm text-muted-foreground">
          {selectedIds.size} / {MAX_RENDERS_PER_BATCH} selected
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Hook</TableHead>
            <TableHead>Body</TableHead>
            <TableHead>Style</TableHead>
            <TableHead>CTA</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scripts.map((script) => (
            <TableRow
              key={script.id}
              className="cursor-pointer"
              onClick={() => onToggle(script.id)}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(script.id)}
                  disabled={
                    !selectedIds.has(script.id) &&
                    selectedIds.size >= MAX_RENDERS_PER_BATCH
                  }
                />
              </TableCell>
              <TableCell className="max-w-[150px] text-sm">
                {truncate(script.body.split("\n")[0] || "", 50)}
              </TableCell>
              <TableCell className="max-w-[200px] text-sm">
                {truncate(script.body, 80)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{script.style}</Badge>
              </TableCell>
              <TableCell className="text-sm">{truncate(script.cta, 30)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
