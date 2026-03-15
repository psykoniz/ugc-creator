"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoPlayerModalProps {
  url: string | null;
  onClose: () => void;
}

export function VideoPlayerModal({ url, onClose }: VideoPlayerModalProps) {
  return (
    <Dialog open={!!url} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Video Preview</DialogTitle>
        </DialogHeader>
        {url && (
          <video src={url} controls autoPlay className="w-full rounded-md" />
        )}
      </DialogContent>
    </Dialog>
  );
}
