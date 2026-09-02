import { cn } from "@/lib/utils";

export type Status = "up" | "down" | "unknown";

const STYLES: Record<Status, string> = {
  up: "bg-ok",
  down: "bg-danger",
  unknown: "bg-muted-foreground",
};

const LABELS: Record<Status, string> = {
  up: "Healthy",
  down: "Down",
  unknown: "No data",
};

export function StatusDot({ status, showLabel = false }: { status: Status; showLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", STYLES[status])}
        aria-hidden
      />
      <span className={cn("text-sm", showLabel ? "" : "sr-only")}>{LABELS[status]}</span>
    </span>
  );
}
