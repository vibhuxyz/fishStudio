import React from "react";
import { BellRing } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import useSeller from "@/hooks/useSeller";

interface NotificationBellProps {
  color?: string;
  size?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ color = "#969696", size = 24 }) => {
  const { seller } = useSeller();
  const { unreadCount } = useNotifications(seller?.id);

  return (
    <div className="relative inline-flex items-center">
      <BellRing size={size} color={color} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-in fade-in zoom-in duration-300">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
