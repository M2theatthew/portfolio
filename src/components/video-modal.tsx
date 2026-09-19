import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function VideoModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 bg-bg-deep/80 backdrop-blur-sm" />
        <Dialog.Content className="modal-content fixed top-1/2 left-1/2 w-[min(92vw,56rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-2 shadow-(--shadow-card) outline-none">
          <Dialog.Title className="sr-only">Upstate Technology Solutions intro</Dialog.Title>
          <Dialog.Close
            className="pressable absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-full bg-bg-deep/80 text-fg"
            aria-label="Close video"
          >
            <X className="size-4" />
          </Dialog.Close>
          <video
            className="aspect-video w-full rounded-xl bg-bg-deep"
            src="/videos/intro.mp4"
            poster="/projects/clemson.jpg"
            controls
            autoPlay={open}
            playsInline
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
