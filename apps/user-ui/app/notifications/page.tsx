"use client";

import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/lib/auth-store";
import { useModals } from "@/components/providers/modal-provider";

export default function NotificationsPage() {
  const { user, isLoggedIn } = useAuth();
  const modals = useModals();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications(user?.id);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <Bell className="h-12 w-12 text-primary" />
        <p className="text-sm text-muted-foreground">
          Log in to see your notifications.
        </p>
        <button
          onClick={modals.openLogin}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          Log in / Sign up
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 md:px-6 md:pb-10">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <Bell className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={`flex w-full gap-3 rounded-2xl border border-border p-4 text-left transition-colors hover:bg-muted/40 ${
                n.isRead ? "bg-card" : "bg-primary/5"
              }`}
            >
              <div className="mt-0.5">
                <span
                  className={`block h-2.5 w-2.5 rounded-full ${
                    n.isRead ? "bg-transparent" : "bg-primary"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
