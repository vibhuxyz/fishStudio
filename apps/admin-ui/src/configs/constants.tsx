import { atom } from "jotai";

export const activeSideBarItem = atom<string>("/dashboard");
export const isSidebarCollapsed = atom<boolean>(false);
