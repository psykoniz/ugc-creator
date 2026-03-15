"use client";

import { cn } from "@/lib/utils";
import type { Script } from "@ugc/shared";

export function ScriptCard({
  script,
  hookText,
  selected,
  onToggle,
}: {
  script: Script;
  hookText: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={cn(
        "cursor-pointer rounded-lg border-2 p-3 transition-colors",
        selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-xs font-medium text-blue-600">{hookText}</p>
          <p className="mt-1 text-sm text-gray-800 line-clamp-3">{script.body}</p>
          <div className="mt-2 flex gap-2">
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
              {script.style}
            </span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
              CTA: {script.cta}
            </span>
          </div>
        </div>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1 h-4 w-4"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
