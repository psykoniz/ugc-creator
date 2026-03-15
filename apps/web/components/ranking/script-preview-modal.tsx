"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Script } from "@ugc/shared";

interface ScriptPreviewModalProps {
  script: Script | null;
  onClose: () => void;
}

export function ScriptPreviewModal({ script, onClose }: ScriptPreviewModalProps) {
  return (
    <Dialog open={!!script} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Script Preview</DialogTitle>
        </DialogHeader>
        {script && (
          <div className="space-y-4">
            <div className="flex gap-2 text-xs">
              <span className="rounded bg-muted px-2 py-0.5 font-medium">{script.style}</span>
              {script.mutationType && (
                <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 font-medium">
                  {script.mutationType}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">Body</h3>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{script.body}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">CTA</h3>
              <p className="text-sm font-medium">{script.cta}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
