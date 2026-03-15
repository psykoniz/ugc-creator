"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/shared/loading-button";
import { MAX_RENDERS_PER_BATCH } from "@ugc/shared";

interface BatchConfigProps {
  selectedCount: number;
  experimentName: string;
  onNameChange: (name: string) => void;
  experimentCreated: boolean;
  onCreateExperiment: () => void;
  onLaunchBatch: () => void;
  loadingExperiment: boolean;
  loadingBatch: boolean;
}

export function BatchConfig({
  selectedCount,
  experimentName,
  onNameChange,
  experimentCreated,
  onCreateExperiment,
  onLaunchBatch,
  loadingExperiment,
  loadingBatch,
}: BatchConfigProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <Label htmlFor="exp-name">Experiment Name</Label>
        <Input
          id="exp-name"
          placeholder="e.g., Q1 Test Batch"
          value={experimentName}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={experimentCreated}
        />
      </div>
      <div className="flex gap-2">
        <LoadingButton
          onClick={onCreateExperiment}
          loading={loadingExperiment}
          disabled={experimentCreated || !experimentName.trim()}
        >
          Create Experiment
        </LoadingButton>
        <LoadingButton
          onClick={onLaunchBatch}
          loading={loadingBatch}
          disabled={!experimentCreated || selectedCount === 0}
        >
          Launch Batch ({selectedCount}/{MAX_RENDERS_PER_BATCH})
        </LoadingButton>
      </div>
    </div>
  );
}
