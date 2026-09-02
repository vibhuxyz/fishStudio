import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border bg-card p-5", className)}>
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

/**
 * One place that decides what a panel shows when it has no chart to draw.
 *
 * "Prometheus is unreachable" and "this query matched nothing" are different
 * problems with different fixes, so they never collapse into one spinner.
 */
export function DataState({
  isLoading,
  error,
  isEmpty,
  children,
}: {
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  children: ReactNode;
}) {
  if (error) {
    return <p className="py-8 text-center text-sm text-danger">{error.message}</p>;
  }
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>;
  }
  if (isEmpty) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No data in this window
      </p>
    );
  }
  return <>{children}</>;
}
