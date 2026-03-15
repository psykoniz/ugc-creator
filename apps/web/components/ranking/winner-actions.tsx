"use client";

import { LoadingButton } from "@/components/shared/loading-button";
import { useAsyncAction } from "@/hooks/use-async-action";
import * as api from "@/lib/api";

interface WinnerActionsProps {
  outputId: string;
  isWinner: boolean;
  onMarked: () => void;
}

export function WinnerActions({ outputId, isWinner, onMarked }: WinnerActionsProps) {
  const { loading, execute } = useAsyncAction();

  const handleMark = async () => {
    await execute(() => api.markWinner(outputId));
    onMarked();
  };

  return (
    <LoadingButton
      variant={isWinner ? "secondary" : "default"}
      size="sm"
      loading={loading}
      disabled={isWinner}
      onClick={handleMark}
    >
      {isWinner ? "Winner" : "Mark Winner"}
    </LoadingButton>
  );
}
