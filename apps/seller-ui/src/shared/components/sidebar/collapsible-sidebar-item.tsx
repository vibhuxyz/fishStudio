"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSidebar from "@/hooks/useSidebar";

interface SubItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface Props {
  title: string;
  icon: React.ReactNode;
  items: SubItem[];
  basePath: string;
}

const CollapsibleSidebarItem = ({ icon, title, items, basePath }: Props) => {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = pathname.startsWith(basePath);

  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const getIconColor = (route: string) =>
    pathname === route ? "#0085ff" : "#969696";

  if (isCollapsed) {
    return (
      <div className="group relative my-2">
        <div
          className={`flex h-12 w-full items-center justify-center rounded-lg transition hover:bg-[#2b2f31] ${
            isActive ? "bg-[#0f3158]" : ""
          }`}
        >
          {icon}
        </div>
        {/* Tooltip/Hover menu could go here */}
      </div>
    );
  }

  return (
    <div className="my-2 block w-full outline-none">
      <button
        onClick={toggleOpen}
        className={`flex min-h-12 w-full items-center justify-between rounded-lg px-[13px] transition hover:bg-[#2b2f31] ${
          isActive && !isOpen ? "bg-[#0f3158]" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
            {icon}
          </div>
          <h5 className="overflow-hidden whitespace-nowrap text-lg text-slate-200">
            {title}
          </h5>
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-1 ml-6 space-y-1 border-l border-slate-700 pl-2">
          {items.map((item) => {
            const isSubActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-10 w-full items-center gap-2 rounded-md px-3 transition hover:bg-[#2b2f31] ${
                  isSubActive ? "bg-[#0f3158d6] text-blue-400" : "text-slate-400"
                }`}
              >
                {item.icon && <div className="flex-shrink-0">{item.icon}</div>}
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSidebarItem;
