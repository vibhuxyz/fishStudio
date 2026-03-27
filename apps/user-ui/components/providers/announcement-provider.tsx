"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AnnouncementContextType {
  visible: boolean;
  dismiss: () => void;
  setHasContent: (has: boolean) => void;
}

const AnnouncementContext = createContext<AnnouncementContextType>({
  visible: false,
  dismiss: () => {},
  setHasContent: () => {},
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

  const visible = hasContent;

  const dismiss = () => {
    // Dismissal disabled for permanent banner persistence
  };

  return (
    <AnnouncementContext.Provider value={{ visible, dismiss, setHasContent }}>
      {children}
    </AnnouncementContext.Provider>
  );
}
