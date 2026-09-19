import { cn } from "@/lib/utils";

export function MountainLogo({ className }: { className?: string }) {
  return (
    <img
      src="/mountain-icon.png"
      alt=""
      aria-hidden="true"
      className={cn("object-contain", className)}
    />
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-3.5", className)}>
      <MountainLogo className="h-11 w-16 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-brand text-[1.85rem] font-bold tracking-[0.08em] text-fg">
          UPSTATE
        </span>
        <span className="mt-1 font-brand text-[0.68rem] font-medium tracking-[0.24em] text-muted">
          TECHNOLOGY SOLUTIONS
        </span>
      </span>
    </span>
  );
}
