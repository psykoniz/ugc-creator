import { Badge } from "@/components/ui/badge";

interface AnglesListProps {
  angles: string[];
}

export function AnglesList({ angles }: AnglesListProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">Angles</h3>
      <div className="flex flex-wrap gap-2">
        {angles.map((angle, i) => (
          <Badge key={i} variant="outline">{angle}</Badge>
        ))}
      </div>
    </div>
  );
}
