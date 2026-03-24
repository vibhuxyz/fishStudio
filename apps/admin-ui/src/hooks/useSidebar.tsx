"use client";

import { useAtom } from "jotai";
import { activeSideBarItem, isSidebarCollapsed } from "../configs/constants";

const useSidebar = () => {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItem);
  const [isCollapsed, setIsCollapsed] = useAtom(isSidebarCollapsed);
  return { activeSidebar, setActiveSidebar, isCollapsed, setIsCollapsed };
};

export default useSidebar;
