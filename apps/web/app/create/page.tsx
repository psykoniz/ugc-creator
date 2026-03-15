"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CreativePack, Hook, Script, Job, Experiment } from "@ugc/shared";
import { useSessionState } from "@/hooks/use-session-state";
import { useAsyncAction } from "@/hooks/use-async-action";
import { AnglesList } from "@/components/create/angles-list";
import { HooksList } from "@/components/create/hooks-list";
import { ScriptsTable } from "@/components/create/scripts-table";
import { BatchConfig } from "@/components/create/batch-config";
import { ErrorBanner } from "@/components/shared/error-banner";
import { EmptyState } from "@/components/shared/empty-state";
import * as api from "@/lib/api";

export default function CreatePage() {
  const router = useRouter();
  const [productId] = useSessionState<string>("productId", "");
  const [creativePackId] = useSessionState<string>("creativePackId", "");
  const [creativePack] = useSessionState<CreativePack | null>("creativePack", null);
  const [hooks] = useSessionState<Hook[]>("hooks", []);
  const [scripts] = useSessionState<Script[]>("scripts", []);
  const [, setExperimentId] = useSessionState<string>("experimentId", "");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [experimentName, setExperimentName] = useState("");
  const [experimentCreated, setExperimentCreated] = useState(false);
  const [localExperimentId, setLocalExperimentId] = useState("");

  const expAction = useAsyncAction<Experiment>();
  const batchAction = useAsyncAction<{ jobs: Job[] }>();

  if (!creativePack) {
    return <EmptyState message="No creative pack found. Please start from the Intake step." />;
  }

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateExperiment = async () => {
    const exp = await expAction.execute(() =>
      api.createExperiment({ productId, creativePackId, name: experimentName })
    );
    if (exp) {
      setExperimentId(exp.id);
      setLocalExperimentId(exp.id);
      setExperimentCreated(true);
    }
  };

  const handleLaunchBatch = async () => {
    const result = await batchAction.execute(() =>
      api.createBatch(localExperimentId, Array.from(selectedIds))
    );
    if (result) {
      router.push("/queue");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Creative Pack</h1>
        <p className="text-sm text-muted-foreground">
          Review angles, hooks, and scripts. Select scripts for batch rendering.
        </p>
      </div>

      <AnglesList angles={creativePack.angles} />
      {hooks.length > 0 && <HooksList hooks={hooks} />}

      {scripts.length > 0 ? (
        <ScriptsTable scripts={scripts} selectedIds={selectedIds} onToggle={handleToggle} />
      ) : (
        <EmptyState message="No scripts generated yet." />
      )}

      <ErrorBanner message={expAction.error || batchAction.error} />

      <BatchConfig
        selectedCount={selectedIds.size}
        experimentName={experimentName}
        onNameChange={setExperimentName}
        experimentCreated={experimentCreated}
        onCreateExperiment={handleCreateExperiment}
        onLaunchBatch={handleLaunchBatch}
        loadingExperiment={expAction.loading}
        loadingBatch={batchAction.loading}
      />
    </div>
  );
}
