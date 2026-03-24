"use client";

// import useSeller from "apps/seller-ui/src/hooks/useSeller";

import { redirect, usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import Link from "next/link";

import SidebarItem from "./sidebar.item";

import SidebarMenu from "./sidebar.menu";
import {
  BarChart3,
  BellPlus,
  BellRing,
  CalendarPlus,
  Headset,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  Settings,
  SquarePlus,
  TicketPercent,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import useSidebar from "@/hooks/useSidebar";
import Logo from "@/assets/svgs/logo";
import Home from "@/assets/icons/home";
import Payment from "@/assets/icons/payment";
import useRequireAuth from "@/hooks/useRequiredAuth";

const SidebarBarWrapper = () => {
  const { activeSidebar, setActiveSidebar, isCollapsed, setIsCollapsed } = useSidebar();
  const pathName = usePathname();
  const { seller } = useRequireAuth();

  useEffect(() => {
    setActiveSidebar(pathName);
    if (pathName === "/dashboard/analytics") {
      setIsCollapsed(true);
    }
  }, [pathName, setActiveSidebar, setIsCollapsed]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";

  const perms = seller?.permissions || [];
  const hasPerm = (p: string) => perms.includes("full_access") || perms.includes(p);

  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: "0",
        overflowY: "scroll",
        scrollbarWidth: "none",
        width: isCollapsed ? "80px" : "280px",
        minWidth: isCollapsed ? "80px" : "250px",
        transition: "width 0.3s ease, min-width 0.3s ease",
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <div className={`flex items-start ${isCollapsed ? "justify-center" : "justify-between"} w-full px-2 pt-4`}>
          {!isCollapsed && (
            <div className="flex flex-col gap-0.5">
              <h3 className="text-2xl font-bold text-white tracking-tight leading-7">
                {seller?.shop?.name || "Vikram Shop"}
              </h3>
              <h5 className="text-sm text-gray-400 font-medium truncate max-w-[200px]">
                {seller?.shop?.address || "Mumbai, India"}
              </h5>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`text-slate-400 hover:text-white transition-all active:scale-95 ${isCollapsed ? "mt-2" : "mt-1.5"}`}
            title="Toggle Sidebar"
          >
            {isCollapsed ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}
          </button>
        </div>
      </Sidebar.Header>

      <div className="block my-6 h-full px-2">
        <Sidebar.Body className="body sidebar space-y-2">
          <SidebarItem
            title="Dashboard Overview"
            icon={<Home fill={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />
          <div className="mt-6 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/orders"}
                title="Orders"
                href="/dashboard/orders"
                icon={
                  <ListOrdered
                    size={26}
                    color={getIconColor("/dashboard/orders")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/payments"}
                title="Payments"
                href="/dashboard/payments"
                icon={<Payment fill={getIconColor("/dashboard/payments")} />}
              />
            </SidebarMenu>

            {hasPerm("product") && (
              <SidebarMenu title="Inventory">
                <SidebarItem
                  isActive={activeSidebar === "/dashboard/create-product"}
                  title="Add From Catalog"
                  href="/dashboard/create-product"
                  icon={
                    <SquarePlus
                      size={24}
                      color={getIconColor("/dashboard/create-product")}
                    />
                  }
                />
                <SidebarItem
                  isActive={activeSidebar === "/dashboard/all-products"}
                  title="Shop Products"
                  href="/dashboard/all-products"
                  icon={
                    <PackageSearch
                      size={22}
                      color={getIconColor("/dashboard/all-products")}
                    />
                  }
                />
              </SidebarMenu>
            )}

            <SidebarMenu title="Staff Management">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/staff-management"}
                title="My Staff"
                href="/dashboard/staff-management"
                icon={
                  <Users
                    size={22}
                    color={getIconColor("/dashboard/staff-management")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/analytics"}
                title="Shop Analytics"
                href="/dashboard/analytics"
                icon={
                  <BarChart3
                    size={22}
                    color={getIconColor("/dashboard/analytics")}
                  />
                }
              />
            </SidebarMenu>

            {hasPerm("event") && (
              <SidebarMenu title="Events">
                <SidebarItem
                  isActive={activeSidebar === "/dashboard/create-event"}
                  title="Create Event"
                  href="/dashboard/create-event"
                  icon={
                    <CalendarPlus
                      size={24}
                      color={getIconColor("/dashboard/create-event")}
                    />
                  }
                />
                <SidebarItem
                  isActive={activeSidebar === "/dashboard/all-events"}
                  title="All Events"
                  href="/dashboard/all-events"
                  icon={
                    <BellPlus
                      size={24}
                      color={getIconColor("/dashboard/all-events")}
                    />
                  }
                />
              </SidebarMenu>
            )}

            <SidebarMenu title="Settings">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/settings"}
                title="Shop Settings"
                href="/dashboard/settings"
                icon={
                  <Settings
                    size={22}
                    color={getIconColor("/dashboard/settings")}
                  />
                }
              />
              {hasPerm("coupon") && (
                <SidebarItem
                  isActive={activeSidebar === "/dashboard/discount-codes"}
                  title="Discount Codes"
                  href="/dashboard/discount-codes"
                  icon={
                    <TicketPercent
                      size={22}
                      color={getIconColor("/dashboard/discount-codes")}
                    />
                  }
                />
              )}
            </SidebarMenu>

            <SidebarMenu title="Account">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/notifications"}
                title="Notifications"
                href="/dashboard/notifications"
                icon={
                  <BellRing
                    size={24}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/logout"}
                title="Logout"
                href="/"
                icon={<LogOut size={20} color={getIconColor("/logout")} />}
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarBarWrapper;
