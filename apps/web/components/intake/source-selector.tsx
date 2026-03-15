"use client";

import { cn } from "@/lib/utils";
import type { IngestSource } from "@ugc/shared";

const sources: { value: IngestSource; label: string }[] = [
  { value: "url", label: "URL" },
  { value: "images", label: "Images" },
  { value: "prompt", label: "Prompt" },
];

interface SourceSelectorProps {
  value: IngestSource;
  onChange: (value: IngestSource) => void;
}

export function SourceSelector({ value, onChange }: SourceSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {sources.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            value === s.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
