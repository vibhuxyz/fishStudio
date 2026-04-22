import { adminQueryKeys } from "@/hooks/useAdminQueries";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import useSidebar from "@/hooks/useSidebar";
import { useAuthStore } from "@/store/authStore";

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href: string;
}

const SidebarItem = ({ icon, title, isActive, href }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isCollapsed } = useSidebar();
  const { setLoggedIn } = useAuthStore();

  const logoutHandler = async () => {
    try {
      await axiosInstance.post("/auth/api/logout-admin", {}, isProtected);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      queryClient.removeQueries({ queryKey: adminQueryKeys.account });
      setLoggedIn(false);
      router.push("/login");
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (title === "Logout") {
      e.preventDefault();
      logoutHandler();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className="my-2 block w-full outline-none" title={isCollapsed ? title : undefined}>
      <div
        className={`flex gap-2 w-full min-h-12 h-full items-center ${isCollapsed ? "justify-center px-0" : "px-[13px]"} rounded-lg cursor-pointer transition hover:bg-[#2b2f31] ${
          isActive
            ? "scale-[.98] bg-[#0f3158] fill-blue-200 hover:!bg-[#0f3158d6]"
            : ""
        }`}
      >
        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">{icon}</div>
        {!isCollapsed && <h5 className="text-slate-200 text-lg whitespace-nowrap overflow-hidden">{title}</h5>}
      </div>
    </Link>
  );
};

export default SidebarItem;
