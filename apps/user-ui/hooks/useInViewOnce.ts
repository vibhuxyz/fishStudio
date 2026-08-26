"use client";

import { useEffect, useRef, useState } from "react";

// Fires once when the element first comes near the viewport, then stops
// observing. Used to defer below-the-fold homepage sections so their queries
// don't compete with the hero and the first product rows for bandwidth.
export function useInViewOnce<T extends HTMLElement>(rootMargin = "300px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return;

    // Older Safari / SSR-hydration edge: without the API, render everything
    // rather than leaving the page permanently stuck on skeletons.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}
