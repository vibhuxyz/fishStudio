"use client";

import { useState } from "react";
import { X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (phone: string) => void;
}

type AuthStep = "phone" | "otp" | "success";

const AuthDialog = ({ isOpen, onClose, onSuccess }: AuthDialogProps) => {
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
    setError("");
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError("");
  };

  const handleSendOtp = async () => {
    // Validate phone number
    if (!phone || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setStep("otp");
      // In real app, send OTP via API
      console.log("OTP sent to:", phone);
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    // Validate OTP
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      console.log("OTP verified for:", phone);

      // Call success callback
      if (onSuccess) {
        onSuccess(phone);
      }

      // Close dialog after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);
    }, 1500);
  };

  const handleClose = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setError("");
    setOtpSent(false);
    onClose();
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setOtpSent(false);
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[90vw] p-0 gap-0 rounded-2xl border-0 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <div className="absolute right-4 top-4 z-50">
          <DialogClose className="rounded-full w-10 h-10 bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* Header */}
        <DialogHeader className="px-6 pt-8 pb-6 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border-b border-border/30">
          <DialogTitle className="text-2xl font-bold text-primary text-center">
            {step === "phone" && "Enter Your Phone Number"}
            {step === "otp" && "Verify OTP"}
            {step === "success" && "Welcome! 🎉"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {step === "phone" && "We'll send you a verification code"}
            {step === "otp" && `Enter the OTP sent to +91 ${phone}`}
            {step === "success" && "You're all set!"}
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-8 space-y-6">
          {/* Phone Step */}
          {step === "phone" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Phone Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  📱 Phone Number
                </label>
                <div className="flex items-center gap-2 border-2 border-primary/20 rounded-lg px-4 py-3 focus-within:border-primary transition-colors">
                  <span className="text-muted-foreground font-medium">+91</span>
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    className="border-0 p-0 focus-visible:ring-0 text-lg placeholder-muted-foreground"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {phone.length}/10 digits
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 space-y-2">
                <div className="flex gap-3 text-sm">
                  <span className="text-lg">ℹ️</span>
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      Why we need this?
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      We use your phone number to secure your account and send
                      order updates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Send OTP Button */}
              <Button
                onClick={handleSendOtp}
                disabled={phone.length !== 10 || loading}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Sending OTP...
                  </span>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </div>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* OTP Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  🔐 Enter OTP
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  className="border-2 border-primary/20 focus:border-primary h-14 text-center text-2xl font-bold letter-spacing-2 rounded-lg transition-colors"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  {otp.length}/6 digits
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Resend Info */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4">
                <p className="text-sm text-amber-900 dark:text-amber-300">
                  Didn't receive OTP?{" "}
                  <button className="font-semibold hover:underline">
                    Resend in 30s
                  </button>
                </p>
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              {/* Back Button */}
              <Button
                onClick={handleBackToPhone}
                variant="outline"
                className="w-full h-12 text-base font-semibold"
              >
                ← Back to Phone Number
              </Button>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="space-y-6 animate-in fade-in duration-300 text-center py-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-4xl">✓</span>
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  Verification Successful!
                </p>
                <p className="text-sm text-muted-foreground">
                  Your account is ready. You'll be logged in shortly.
                </p>
              </div>

              {/* Phone Display */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">
                  Verified Number
                </p>
                <p className="text-lg font-semibold text-foreground">
                  +91 {phone}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
