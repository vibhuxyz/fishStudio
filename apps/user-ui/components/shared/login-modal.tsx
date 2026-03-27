"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Phone, Mail, ArrowRight, Shield, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { setAuthenticatedUser } from "@/lib/auth-store";
import { useAddressStore } from "@/lib/address-store";
import { storefrontKeys } from "@/lib/storefront";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "identifier" | "otp" | "success";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

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
  const isValid = isEmail || isPhone;

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
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP. Please try again.";
      toast.error(msg);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/auth/api/verify-otp", {
        identifier: identifier.trim(),
        otp: otp.join(""),
        name: isNewUser ? fullName.trim() : undefined,
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
      // Fetch full user data (with addresses) and populate address store
      try {
        const { data: userData } = await axiosInstance.get("/auth/api/logged-in-user");
        if (userData?.user?.addresses) {
          useAddressStore.getState().setAddresses(userData.user.addresses);
        }
      } catch (_) {}
      queryClient.invalidateQueries({ queryKey: storefrontKeys.userSession });
      toast.success("Logged in successfully! Welcome back 🐟");
      setStep("success");
      window.setTimeout(() => onOpenChange(false), 1500);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "OTP verification failed. Please try again.";
      toast.error(msg);
    },
  });

  const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

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

  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const interval = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleSendOtp = () => {
    if (!isValid) return;
    sendOtpMutation.mutate();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 4).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (index + i < 4) newOtp[index + i] = d; });
      setOtp(newOtp);
      otpRefs.current[Math.min(index + digits.length, 3)]?.focus();
      return;
    }
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    setTimer(120);
    setOtp(["", "", "", ""]);
    sendOtpMutation.mutate();
  };

  const inputType = identifier.includes("@") ? "email" : "tel";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "identifier" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-foreground">
                Log in or Sign up
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your email or phone number to continue
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-muted-foreground">
                  {isEmail ? (
                    <Mail className="h-4 w-4 text-primary" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                </div>
                <Input
                  type={inputType}
                  placeholder="Email or mobile number"
                  className="h-12 pl-10 text-base"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && isValid) handleSendOtp(); }}
                  autoFocus
                />
              </div>

              {identifier.length > 0 && !isValid && (
                <p className="text-xs text-destructive -mt-2">
                  {identifier.includes("@")
                    ? "Enter a valid email address"
                    : "Enter a valid 10-digit mobile number starting with 6-9"}
                </p>
              )}

              <Button
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
                disabled={!isValid || isLoading}
                onClick={handleSendOtp}
              >
                {isLoading ? "Sending OTP..." : "Continue"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>

              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                By continuing, you agree to our{" "}
                <span className="text-primary underline cursor-pointer">Terms of Service</span>{" "}
                and{" "}
                <span className="text-primary underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-foreground">
                Verify OTP
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                We sent a 4-digit code to{" "}
                <span className="font-medium text-foreground">
                  {isEmail ? identifier : `+91 ${identifier}`}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              {isNewUser && (
                <div className="space-y-2 mb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Enter Full Name
                  </p>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      placeholder="e.g. John Doe"
                      className="h-12 pl-10 text-base"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Enter 4-digit OTP
                </p>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <Input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="h-14 w-12 text-center text-xl font-bold"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        handleOtpChange(i, e.clipboardData.getData("text"));
                      }}
                      autoFocus={!isNewUser && i === 0}
                    />
                  ))}
                </div>
              </div>

              <Button
                className="mt-2 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
                disabled={otp.join("").length < 4 || (isNewUser && !fullName.trim()) || isLoading}
                onClick={() => verifyOtpMutation.mutate()}
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
                <Shield className="h-4 w-4" />
              </Button>

              <div className="mt-2 text-center">
                {timer > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Resend OTP in <span className="font-medium text-foreground">{timer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={handleResendOtp}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                className="mt-2 block w-full text-center text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setStep("identifier")}
              >
                Change email / phone number
              </button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-offer-green/10">
              <Shield className="h-8 w-8 text-offer-green" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
              Welcome!
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              You have been successfully logged in. Enjoy fresh fish and meat delivered to your doorstep!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
