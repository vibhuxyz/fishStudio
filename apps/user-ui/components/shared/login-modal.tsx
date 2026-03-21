"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Phone, ArrowRight, Shield } from "lucide-react";
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
import { storefrontKeys } from "@/lib/storefront";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "phone" | "otp" | "success";

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]); // Changed to 4 digits
  const [timer, setTimer] = useState(30);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const queryClient = useQueryClient();

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post("/auth/api/send-otp", {
        phone_number: phone,
      });
    },
    onSuccess: () => {
      toast.success("OTP sent to your mobile number.");
      setStep("otp");
      setTimer(30);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      );
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const otpValue = otp.join("");
      const response = await axiosInstance.post("/auth/api/verify-otp", {
        phone_number: phone,
        otp: otpValue,
      });

      return response.data.user;
    },
    onSuccess: (user) => {
      setAuthenticatedUser({
        id: user.id,
        name: user.name,
        phone: user.phone_number,
      });
      queryClient.invalidateQueries({ queryKey: storefrontKeys.userSession });
      toast.success("Logged in successfully.");
      setStep("success");
      window.setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "OTP verification failed. Please try again.",
      );
    },
  });

  const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep("phone");
      setPhone("");
      setOtp(["", "", "", ""]); // Changed to 4 digits
      setTimer(30);
    }
  }, [open]);

  // OTP countdown timer
  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleSendOtp = () => {
    if (phone.length < 10) return;
    sendOtpMutation.mutate();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 4).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 3);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const otpValue = otp.join("");
    if (otpValue.length < 4) return;
    verifyOtpMutation.mutate();
  };

  const handleResendOtp = () => {
    setTimer(30);
    setOtp(["", "", "", ""]); // Changed to 4 digits
    sendOtpMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "phone" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-foreground">
                Log in or Sign up
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your phone number to continue
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+91</span>
                  <span className="text-border">|</span>
                </div>
                <Input
                  type="tel"
                  placeholder="Enter mobile number"
                  className="h-12 pl-20 text-base"
                  maxLength={10}
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendOtp();
                  }}
                />
              </div>

              <Button
                className="mt-4 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
                disabled={phone.length < 10 || isLoading}
                onClick={handleSendOtp}
              >
                {isLoading ? "Sending OTP..." : "Continue"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>

              <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
                By continuing, you agree to our{" "}
                <span className="text-primary underline">Terms of Service</span>{" "}
                and{" "}
                <span className="text-primary underline">Privacy Policy</span>
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
                We sent a 4-digit code to +91 {phone}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="h-12 w-12 text-center text-lg font-semibold"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text");
                      handleOtpChange(i, pasted);
                    }}
                  />
                ))}
              </div>

              <Button
                className="mt-5 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
                disabled={otp.join("").length < 4 || isLoading} // Changed to < 4
                onClick={handleVerifyOtp}
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
                <Shield className="h-4 w-4" />
              </Button>

              <div className="mt-4 text-center">
                {timer > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend OTP in{" "}
                    <span className="font-medium text-foreground">
                      {timer}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    className="text-sm font-medium text-primary hover:underline"
                    onClick={handleResendOtp}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                className="mt-3 block w-full text-center text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setStep("phone")}
              >
                Change phone number
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
              You have been successfully logged in. Enjoy fresh fish and meat
              delivered to your doorstep!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
