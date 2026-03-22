"use client";

import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box";
import { Sidebar } from "../sidebar/sidebar.styles";
import Link from "next/link";
import SidebarItem from "../sidebar/sidebar.item";
import SidebarMenu from "../sidebar/sidebar.menu";
import { ListOrdered, LogOut } from "lucide-react";
import useSidebar from "@/hooks/useSidebar";
import Logo from "@/assets/svgs/logo";
import useRequireStaff from "@/hooks/useRequireStaff";
import { useRouter } from "next/navigation";

// TODO: restore real logout once backend is wired:
// import axiosInstance from "@/utils/axiosInstance";
// import { useQueryClient } from "@tanstack/react-query";

const StaffSidebar = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { staff } = useRequireStaff();
  const router = useRouter();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";

  const handleLogout = () => {
    // TODO: replace with real logout:
    // await axiosInstance.post("/auth/api/logout-staff");
    // queryClient.invalidateQueries({ queryKey: ["seller"] });
    router.push("/login");
  };

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
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href="/" className="flex justify-center text-center gap-2">
            <Logo />
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {staff?.seller?.store?.name ?? "Staff Portal"}
              </h3>
              <h5 className="font-medium pl-2 text-xs text-green-400 whitespace-nowrap">
                Staff Account
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <div className="mt-2 block">
            <SidebarMenu title="Orders">
              <SidebarItem
                isActive={activeSidebar === "/staff/orders"}
                title="All Orders"
                href="/staff/orders"
                icon={
                  <ListOrdered
                    size={26}
                    color={getIconColor("/staff/orders")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Account">
              <div className="my-2 block">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex gap-2 w-full min-h-12 h-full items-center px-[13px] rounded-lg cursor-pointer transition hover:bg-[#2b2f31]"
                >
                  <LogOut size={20} color="#969696" />
                  <h5 className="text-slate-200 text-lg">Logout</h5>
                </button>
              </div>
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default StaffSidebar;

