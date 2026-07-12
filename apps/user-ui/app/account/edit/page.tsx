"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth, updateProfile } from "@/lib/auth-store";
import { useModals } from "@/components/providers/modal-provider";
import { toast } from "sonner";

export default function EditProfilePage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const modals = useModals();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (!isLoggedIn || !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-muted-foreground">Please log in to edit your profile.</p>
        <button
          onClick={modals.openLogin}
          className="rounded-xl bg-[#5A2C96] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Log in / Sign up
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      toast.success("Profile updated");
      router.push("/account");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Could not update profile",
      );
    } finally {
      setSaving(false);
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

      <h1 className="mb-6 text-xl font-bold text-foreground md:text-2xl">
        Edit Profile
      </h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Full Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#5A2C96]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#5A2C96]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Phone
          </label>
          <input
            value={user.phone || ""}
            readOnly
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground outline-none"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Phone number is your login ID and can&apos;t be changed here.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-[#5A2C96] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
