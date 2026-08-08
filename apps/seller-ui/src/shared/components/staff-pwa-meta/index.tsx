"use client";
import { useEffect } from "react";

/**
 * Links the staff-portal PWA manifest and registers its service worker.
 * Scoped to /staff/* only — mounted inside the staff login page and each
 * staff-role layout, never the app root, so the seller dashboard (desktop,
 * not meant to be installable) is unaffected.
 */
const StaffPwaMeta = () => {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const previousHref = link?.getAttribute("href") ?? null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.setAttribute("href", "/staff/manifest.json");

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/staff/sw.js", { scope: "/staff/" }).catch(() => {
        // Installability is a progressive enhancement — a failed registration
        // (e.g. unsupported browser) shouldn't block the page from working.
      });
    }

    return () => {
      // Restore whatever manifest (if any) the rest of the app expects once
      // navigation leaves /staff/*.
      if (previousHref) link?.setAttribute("href", previousHref);
      else link?.remove();
    };
  }, []);

  return null;
};

export default StaffPwaMeta;
