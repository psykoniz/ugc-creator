import { SCORING_WEIGHTS } from "@ugc/shared";

interface ScoreBreakdownProps {
  heuristicScore: number;
  llmScore: number;
  businessScore: number;
}

function ScoreBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label} (w:{weight})</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ScoreBreakdown({ heuristicScore, llmScore, businessScore }: ScoreBreakdownProps) {
  return (
    <div className="w-32 space-y-1">
      <ScoreBar label="Heuristic" score={heuristicScore} weight={SCORING_WEIGHTS.heuristic} />
      <ScoreBar label="LLM" score={llmScore} weight={SCORING_WEIGHTS.llm} />
      <ScoreBar label="Business" score={businessScore} weight={SCORING_WEIGHTS.business} />
    </div>
  );
}
