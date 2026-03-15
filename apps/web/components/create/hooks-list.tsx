import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Hook } from "@ugc/shared";

interface HooksListProps {
  hooks: Hook[];
}

export function HooksList({ hooks }: HooksListProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">Hooks</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {hooks.map((hook) => (
          <Card key={hook.id}>
            <CardContent className="p-3">
              <p className="text-sm">{hook.text}</p>
              <Badge variant="secondary" className="mt-2">{hook.angle}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
