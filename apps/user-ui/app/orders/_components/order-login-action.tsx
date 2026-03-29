"use client";

import { Button } from "@/components/ui/button";
import { useModals } from "@/components/providers/modal-provider";
import { useAuth } from "@/lib/auth-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function OrderLoginAction() {
  const { openLogin } = useModals();
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  // If user logs in while on this "Sign in" page, refresh to show orders
  useEffect(() => {
    if (isLoggedIn) {
      router.refresh();
    }
  }, [isLoggedIn, router]);

  return (
    <Button 
      className="bg-offer-green text-white hover:bg-offer-green/90 h-11 px-8 rounded-full font-bold shadow-lg transition-all active:scale-95"
      onClick={openLogin}
    >
      Log in / Sign up
    </Button>
  );
}
