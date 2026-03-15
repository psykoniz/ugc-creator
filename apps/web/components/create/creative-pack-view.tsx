"use client";

import type { CreativePack, Hook, Script } from "@ugc/shared";
import { ScriptCard } from "./script-card";

export function CreativePackView({
  pack,
  hooks,
  scripts,
  selectedIds,
  onToggleScript,
}: {
  pack: CreativePack;
  hooks: Hook[];
  scripts: Script[];
  selectedIds: Set<string>;
  onToggleScript: (id: string) => void;
}) {
  const hookMap = new Map(hooks.map((h) => [h.id, h]));

  return (
    <div className="space-y-6">
      {/* Angles */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">Angles</h3>
        <div className="flex flex-wrap gap-2">
          {pack.angles.map((angle, i) => (
            <span key={i} className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
              {angle}
            </span>
          ))}
        </div>
      </div>

      {/* Hooks */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">
          Hooks ({hooks.length})
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {hooks.map((hook) => (
            <div key={hook.id} className="rounded border border-gray-200 p-2">
              <p className="text-sm">{hook.text}</p>
              <p className="mt-1 text-xs text-gray-500">{hook.angle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scripts */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">
          Scripts ({scripts.length}) — Select for batch
        </h3>
        <div className="space-y-2">
          {scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              hookText={hookMap.get(script.hookId)?.text ?? ""}
              selected={selectedIds.has(script.id)}
              onToggle={() => onToggleScript(script.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
