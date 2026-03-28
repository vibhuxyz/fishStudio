"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AnnouncementContextType {
  visible: boolean;
  dismiss: () => void;
  setHasContent: (has: boolean) => void;
  suppress: () => void;
  unsuppress: () => void;
}

const AnnouncementContext = createContext<AnnouncementContextType>({
  visible: false,
  dismiss: () => {},
  setHasContent: () => {},
  suppress: () => {},
  unsuppress: () => {},
});

export function useAnnouncement() {
  return useContext(AnnouncementContext);
}

export function AnnouncementProvider({
  children,
  hasContent: initialHasContent,
}: {
  children: ReactNode;
  hasContent: boolean;
}) {
  const [hasContent, setHasContent] = useState(initialHasContent);
  const [suppressed, setSuppressed] = useState(false);

  const visible = hasContent && !suppressed;

  const dismiss = () => {
    // Dismissal disabled for permanent banner persistence
  };

  const suppress = () => setSuppressed(true);
  const unsuppress = () => setSuppressed(false);

  return (
    <AnnouncementContext.Provider value={{ visible, dismiss, setHasContent, suppress, unsuppress }}>
      {children}
    </AnnouncementContext.Provider>
  );
}
