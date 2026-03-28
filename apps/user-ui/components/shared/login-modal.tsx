"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  User,
  Fish,
  CheckCircle2,
  Truck,
  Clock,
  Star,
  MessageSquare,
  PhoneCall,
  X,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { setAuthenticatedUser } from "@/lib/auth-store";
import { useAddressStore } from "@/lib/address-store";
import { storefrontKeys } from "@/lib/storefront";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "identifier" | "otp" | "name" | "success";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const slideVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

/* ─── Left branding panel ────────────────────────────────────────────────── */
function BrandPanel() {
  return (
    <div className="hidden md:flex md:w-[50%] flex-shrink-0 flex-col items-center justify-between bg-gradient-to-b from-primary to-primary/85 p-8 text-primary-foreground">
      {/* Logo */}
      <div className="flex w-full items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <Fish className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Fish Studio</p>
          <p className="text-[10px] text-white/70">Fresh Fish &amp; Meat</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="rounded-2xl bg-white p-3 shadow-lg">
          <Image
            src="/qr-app.svg"
            alt="Scan to open Fish Studio app"
            width={130}
            height={130}
            className="block"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Use Camera App to Scan</p>
          <p className="mt-0.5 text-xs text-white/70">Opens Fish Studio on your phone</p>
        </div>
      </div>

      {/* Features */}
      <div className="w-full space-y-2.5">
        {[
          { icon: Clock, text: "30-min express delivery" },
          { icon: Star,  text: "Premium quality, always fresh" },
          { icon: Truck, text: "Free delivery above ₹500" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5">
            <Icon className="h-4 w-4 flex-shrink-0 text-white/80" />
            <span className="text-xs font-medium text-white/90">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(120);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const queryClient = useQueryClient();

  const isEmail = EMAIL_REGEX.test(identifier.trim());
  const isPhone = PHONE_REGEX.test(identifier.trim());
  const isPhoneInput = /^\d+$/.test(identifier.trim()) && !identifier.includes("@");
  const isValid = isEmail || isPhone;

  /* ── Mutations ── */
  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/auth/api/send-otp", {
        identifier: identifier.trim(),
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "OTP sent successfully.");
      setIsNewUser(!!data.isNewUser);
      setStep("otp");
      setTimer(120);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to send OTP. Please try again.",
      );
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (name?: string) => {
      const { data } = await axiosInstance.post("/auth/api/verify-otp", {
        identifier: identifier.trim(),
        otp: otp.join(""),
        name: name ?? (isNewUser ? fullName.trim() : undefined),
      });
      return data;
    },
    onSuccess: async (data) => {
      setAuthenticatedUser({
        id: data.user.id,
        name: data.user.name,
        phone: data.user.phone_number || "",
        email: data.user.email || "",
      });
      try {
        const { data: userData } = await axiosInstance.get("/auth/api/logged-in-user");
        if (userData?.user?.addresses) {
          useAddressStore.getState().setAddresses(userData.user.addresses);
        }
      } catch (_) {}
      queryClient.invalidateQueries({ queryKey: storefrontKeys.userSession });
      toast.success("Welcome to Fish Studio! 🐟");
      setStep("success");
      window.setTimeout(() => onOpenChange(false), 1800);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "OTP verification failed. Please try again.",
      );
    },
  });

  const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  /* ── Reset on open ── */
  useEffect(() => {
    if (open) {
      setStep("identifier");
      setIdentifier("");
      setFullName("");
      setIsNewUser(false);
      setOtp(["", "", "", ""]);
      setTimer(120);
    }
  }, [open]);

  /* ── OTP countdown ── */
  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const interval = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  /* ── OTP input handlers ── */
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 4).split("");
      const next = [...otp];
      digits.forEach((d, i) => { if (index + i < 4) next[index + i] = d; });
      setOtp(next);
      const focusIdx = Math.min(index + digits.length, 3);
      otpRefs.current[focusIdx]?.focus();
      // auto-advance if full
      if (next.join("").length === 4) onOtpComplete(next.join(""));
      return;
    }
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
    if (next.join("").length === 4) onOtpComplete(next.join(""));
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const onOtpComplete = (code: string) => {
    if (isNewUser) {
      // Go to name step; OTP verified together with name
      setStep("name");
    } else {
      verifyOtpMutation.mutate(undefined);
    }
  };

  const handleResendOtp = () => {
    setTimer(120);
    setOtp(["", "", "", ""]);
    sendOtpMutation.mutate();
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const maskedIdentifier = isEmail
    ? identifier
    : `+91${identifier.trim()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:rounded-3xl gap-0 overflow-hidden p-0 sm:max-w-[680px] [&>button]:hidden">
        <div className="flex min-h-[480px]">
          <BrandPanel />

          {/* Right — form */}
          <div className="relative flex flex-1 flex-col">
            {/* Close button */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <AnimatePresence mode="wait">
              {/* ── Step 1: Identifier ── */}
              {step === "identifier" && (
                <motion.div
                  key="identifier"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex flex-1 flex-col justify-center px-7 py-10"
                >
                  <h2 className="text-xl font-bold !text-foreground">
                    Login or sign up
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your phone number or email to continue
                  </p>

                  {/* Input */}
                  <div className="mt-7 space-y-4">
                    <div className="flex overflow-hidden rounded-xl border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      {/* +91 prefix — only when typing phone */}
                      <AnimatePresence>
                        {isPhoneInput && (
                          <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "auto", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center border-r border-border bg-muted px-3 text-sm font-semibold text-foreground overflow-hidden whitespace-nowrap"
                          >
                            +91
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <input
                        type={isEmail ? "email" : "tel"}
                        placeholder="Phone number or email"
                        className="h-12 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && isValid) sendOtpMutation.mutate(); }}
                        autoFocus
                      />
                    </div>

                    {identifier.length > 2 && !isValid && (
                      <p className="text-xs text-destructive">
                        {identifier.includes("@")
                          ? "Enter a valid email address"
                          : "Enter a valid 10-digit mobile number (starts with 6–9)"}
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={!isValid || isLoading}
                      onClick={() => sendOtpMutation.mutate()}
                      className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background: isValid
                          ? "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.75) 100%)"
                          : undefined,
                        backgroundColor: !isValid ? "hsl(var(--muted))" : undefined,
                        color: !isValid ? "hsl(var(--muted-foreground))" : "white",
                      }}
                    >
                      {isLoading ? "Sending OTP…" : (
                        <span className="flex items-center justify-center gap-2">
                          Get OTP <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </button>

                    <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                      By proceeding you confirm that you agree to our{" "}
                      <span className="cursor-pointer font-semibold text-foreground hover:underline">
                        Privacy Policy
                      </span>{" "}
                      &amp;{" "}
                      <span className="cursor-pointer font-semibold text-foreground hover:underline">
                        Terms of Use
                      </span>
                      .
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: OTP ── */}
              {step === "otp" && (
                <motion.div
                  key="otp"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex flex-1 flex-col justify-center px-7 py-10"
                >
                  <button
                    type="button"
                    onClick={() => setStep("identifier")}
                    className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>

                  <h2 className="text-lg font-bold text-foreground">
                    Enter OTP sent to{" "}
                    <span className="text-primary">{maskedIdentifier}</span>
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    We've sent a 4-digit code. It expires in 10 minutes.
                  </p>

                  {/* 4 OTP boxes */}
                  <div className="mt-7 flex gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={(e) => {
                          e.preventDefault();
                          handleOtpChange(i, e.clipboardData.getData("text"));
                        }}
                        autoFocus={i === 0}
                        className="h-14 w-14 rounded-xl border-2 border-border bg-background text-center text-xl font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    ))}
                  </div>

                  {isLoading && (
                    <p className="mt-4 text-sm text-muted-foreground animate-pulse">
                      Verifying…
                    </p>
                  )}

                  {/* Timer + resend */}
                  <div className="mt-5">
                    {timer > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Resend OTP in{" "}
                        <span className="font-bold text-foreground">{fmt(timer)}</span>
                      </p>
                    ) : (
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> SMS
                        </button>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          <PhoneCall className="h-3.5 w-3.5" /> Call
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Name (new users only) ── */}
              {step === "name" && (
                <motion.div
                  key="name"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex flex-1 flex-col justify-center px-7 py-10"
                >
                  <button
                    type="button"
                    onClick={() => setStep("otp")}
                    className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>

                  <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit">
                    🎉 New account
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-foreground">
                    What's your name?
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Just this once — so we know what to call you!
                  </p>

                  <div className="mt-7 space-y-4">
                    <div className="flex overflow-hidden rounded-full border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <div className="flex items-center border-r border-border bg-muted px-3 text-muted-foreground">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Arjun Sharma"
                        className="h-12 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && fullName.trim().length >= 2) {
                            verifyOtpMutation.mutate(fullName.trim());
                          }
                        }}
                        autoFocus
                      />
                    </div>

                    <button
                      type="button"
                      disabled={fullName.trim().length < 2 || isLoading}
                      onClick={() => verifyOtpMutation.mutate(fullName.trim())}
                      className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background: fullName.trim().length >= 2
                          ? "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.75) 100%)"
                          : undefined,
                        backgroundColor: fullName.trim().length < 2 ? "hsl(var(--muted))" : undefined,
                        color: fullName.trim().length < 2 ? "hsl(var(--muted-foreground))" : "white",
                      }}
                    >
                      {isLoading ? "Creating account…" : (
                        <span className="flex items-center justify-center gap-2">
                          Create Account <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Success ── */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-1 flex-col items-center justify-center gap-4 px-7 py-10 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl"
                  >
                    ✅
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      Welcome{isNewUser ? "!" : " back!"}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You're all set. Enjoy fresh fish &amp; meat delivered to your door 🐟
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
