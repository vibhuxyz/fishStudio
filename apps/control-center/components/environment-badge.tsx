import { cn } from "@/lib/utils";

/**
 * The numbers on this dashboard are genuinely measured. Where the traffic that
 * produced them came from is a separate question, and this badge answers it
 * honestly rather than letting a synthetic load test read as production.
 */
export function EnvironmentBadge({ environment }: { environment: "local" | "production" }) {
  const isProduction = environment === "production";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        isProduction
          ? "border-ok/40 bg-ok/10 text-ok"
          : "border-warn/40 bg-warn/10 text-warn",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isProduction ? "bg-ok" : "bg-warn",
        )}
      />
      {isProduction ? "Production traffic" : "Local stack · synthetic load"}
    </span>
  );
}
