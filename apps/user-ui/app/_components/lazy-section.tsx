"use client";

import type { ReactNode } from "react";
import { useInViewOnce } from "@/hooks/useInViewOnce";

interface LazySectionProps {
  children: ReactNode;
  /** Rendered in the section's place until it scrolls into range. */
  fallback: ReactNode;
  /** How far ahead of the viewport to start mounting. */
  rootMargin?: string;
}

// Keeps a homepage section unmounted until it is close to the viewport. The
// children only mount then, so the data fetches inside them start in scroll
// order instead of all firing on first paint.
export function LazySection({ children, fallback, rootMargin }: LazySectionProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(rootMargin);

  return <div ref={ref}>{inView ? children : fallback}</div>;
}
