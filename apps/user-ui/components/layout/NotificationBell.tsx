"use client";

import React from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between p-4 pb-2">
          <span className="font-bold">Notifications</span>
          {unreadCount > 0 && (
            <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-blue-600 hover:underline"
            >
                Mark all as read
            </button>
          )}
        </DropdownMenuLabel>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 opacity-50">
              <Bell size={40} className="mb-2" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className={`flex flex-col items-start gap-1 p-4 cursor-default border-b last:border-0 ${
                    !n.isRead ? "bg-blue-50/50" : ""
                  }`}
                  onSelect={(e) => {
                    e.preventDefault();
                    if (!n.isRead) markAsRead(n.id);
                  }}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className={`text-sm font-semibold ${!n.isRead ? "text-blue-900" : "text-gray-900"}`}>
                        {n.title}
                    </span>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t">
            <Link href="/orders" className="block w-full text-center text-xs font-semibold py-2 hover:bg-gray-100 rounded-md transition-colors">
                View All Orders
            </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
