"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Laptop, Smartphone, Monitor } from "lucide-react";
import { useAuth, listSessions, revokeSession, type DeviceSession } from "@/lib/auth-store";
import { useModals } from "@/components/providers/modal-provider";
import { toast } from "sonner";

const platformIcon = (platform: string) => {
  if (platform === "ios" || platform === "android") return Smartphone;
  if (platform === "web") return Laptop;
  return Monitor;
};

const formatLastActive = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Active now";
  if (minutes < 60) return `Active ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Active ${days}d ago`;
};

export default function DevicesPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const modals = useModals();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["login-devices"],
    queryFn: listSessions,
    enabled: isLoggedIn,
  });

  if (!isLoggedIn) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-muted-foreground">Please log in to manage your devices.</p>
        <button
          onClick={modals.openLogin}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          Log in / Sign up
        </button>
      </div>
    );
  }

  const handleSignOut = async (session: DeviceSession) => {
    try {
      await revokeSession(session.sid);
      toast.success(`Signed out of ${session.deviceLabel}`);
      queryClient.invalidateQueries({ queryKey: ["login-devices"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not sign out that device");
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 pb-28 md:px-6 md:pb-10">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="mb-1 text-xl font-bold text-foreground md:text-2xl">Login Devices</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {data ? `${data.count} of ${data.limit} devices signed in` : "Loading your devices…"}
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-3">
          {data?.sessions.map((session) => {
            const Icon = platformIcon(session.platform);
            return (
              <div
                key={session.sid}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {session.deviceLabel}
                      {session.current && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          This device
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatLastActive(session.lastUsedAt)}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <button
                    onClick={() => handleSignOut(session)}
                    className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Sign out
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
