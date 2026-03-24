import React from "react";
import useSidebar from "@/hooks/useSidebar";

interface Props {
  title: string;
  children: React.ReactNode;
}

const SidebarMenu = ({ title, children }: Props) => {
  const { isCollapsed } = useSidebar();
  return (
    <div className="block">
      {!isCollapsed && <h3 className="text-xs tracking-[0.04rem] pl-1 text-slate-400 mt-4 mb-2">{title}</h3>}
      {children}
    </div>
  );
};

export default SidebarMenu;
