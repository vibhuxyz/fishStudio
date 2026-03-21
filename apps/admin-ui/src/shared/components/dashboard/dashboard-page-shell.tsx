"use client";

import React from "react";
import { Search } from "lucide-react";
import BreadCrumbs from "@/shared/components/breadcrumbs";

type SearchConfig = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

interface DashboardPageShellProps {
  title: string;
  breadcrumbTitle?: string;
  description?: string;
  action?: React.ReactNode;
  search?: SearchConfig;
  children: React.ReactNode;
}

const DashboardPageShell = ({
  title,
  breadcrumbTitle,
  description,
  action,
  search,
  children,
}: DashboardPageShellProps) => {
  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl text-white font-semibold">{title}</h2>
          {description ? <p className="mt-1 text-sm text-gray-400">{description}</p> : null}
          <div className="mt-2">
            <BreadCrumbs title={breadcrumbTitle ?? title} />
          </div>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {search ? (
        <div className="my-4 flex items-center bg-gray-900 p-2 rounded-md max-w-xl">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder={search.placeholder}
            className="w-full bg-transparent text-white outline-none"
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
          />
        </div>
      ) : null}

      {children}
    </div>
  );
};

export default DashboardPageShell;
