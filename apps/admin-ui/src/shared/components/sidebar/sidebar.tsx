"use client";

import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import Link from "next/link";

import SidebarItem from "./sidebar.item";

import SidebarMenu from "./sidebar.menu";
import {
  BarChart3,
  Blocks,
  BellRing,
  LogOut,
  PackageSearch,
  Pencil,
  Settings,
  SquarePlus,
  TicketPercent,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Image as ImageIcon,
  ClipboardCheck,
} from "lucide-react";

import useSidebar from "@/hooks/useSidebar";
import Logo from "@/assets/svgs/logo";
import Home from "@/assets/icons/home";
import Payment from "@/assets/icons/payment";
import useRequireAuth from "@/hooks/useRequiredAuth";
import NotificationBell from "../notifications/NotificationBell";

const SidebarBarWrapper = () => {
  const { activeSidebar, setActiveSidebar, isCollapsed, setIsCollapsed } =
    useSidebar();
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
        <div
          className={`flex items-start ${isCollapsed ? "justify-center" : "justify-between"} w-full px-2 pt-4`}
        >
          {!isCollapsed && (
            <div className="flex flex-col gap-0.5">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {seller?.name || "Vikram Admin"}
              </h3>
              <h5 className="text-sm text-gray-400 font-medium lowercase">
                {seller?.email || "vikram.admin@gmail.com"}
              </h5>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`text-slate-400 hover:text-white transition-all active:scale-95 ${isCollapsed ? "mt-2" : "mt-1.5"}`}
            title="Toggle Sidebar"
          >
            {isCollapsed ? (
              <PanelLeftOpen size={22} />
            ) : (
              <PanelLeftClose size={22} />
            )}
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

          <SidebarItem
            isActive={activeSidebar === "/dashboard/notifications"}
            title="Notifications"
            href="/dashboard/notifications"
            icon={
              <NotificationBell
                size={24}
                color={getIconColor("/dashboard/notifications")}
              />
            }
          />
          <div className="mt-6 block">
            <SidebarMenu title="Inventory">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/create-product"}
                title="Create Product"
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
                title="All Products"
                href="/dashboard/all-products"
                icon={
                  <PackageSearch
                    size={22}
                    color={getIconColor("/dashboard/all-products")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/categories"}
                title="Categories"
                href="/dashboard/categories"
                icon={
                  <Blocks
                    size={22}
                    color={getIconColor("/dashboard/categories")}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Sellers & Analytics">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/sellers"}
                title="Seller Management"
                href="/dashboard/sellers"
                icon={
                  <Users size={22} color={getIconColor("/dashboard/sellers")} />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/analytics"}
                title="Geo Analytics"
                href="/dashboard/analytics"
                icon={
                  <BarChart3
                    size={22}
                    color={getIconColor("/dashboard/analytics")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/payments"}
                title="Payment History"
                href="/dashboard/payments"
                icon={<Payment fill={getIconColor("/dashboard/payments")} />}
              />
            </SidebarMenu>

            <SidebarMenu title="Marketing">
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
              <SidebarItem
                isActive={activeSidebar === "/dashboard/banners"}
                title="Admin Banners"
                href="/dashboard/banners"
                icon={
                  <ImageIcon
                    size={22}
                    color={getIconColor("/dashboard/banners")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/banner-review"}
                title="Category Banner & Review"
                href="/dashboard/banner-review"
                icon={
                  <ClipboardCheck
                    size={22}
                    color={getIconColor("/dashboard/banner-review")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Account">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/settings"}
                title="Settings"
                href="/dashboard/settings"
                icon={
                  <Settings
                    size={22}
                    color={getIconColor("/dashboard/settings")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Session">
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
