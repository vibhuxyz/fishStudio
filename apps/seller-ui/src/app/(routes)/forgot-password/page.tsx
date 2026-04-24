"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@repo/ui";
import AuthLayout from "@/shared/components/layout/AuthLayout";
import { frontendEnv } from "@/config/env";

type EmailForm = { email: string };
type ResetForm = { otp: string; newPassword: string; confirmPassword: string };

const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const emailForm = useForm<EmailForm>({ mode: "onChange" });
  const resetForm = useForm<ResetForm>({ mode: "onChange" });

  const sendOtpMutation = useMutation({
    mutationFn: async (data: EmailForm) => {
      const res = await axios.post(
        `${frontendEnv.apiUrl}/auth/api/forgot-password-seller`,
        data,
        { withCredentials: true },
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      setServerError(null);
      setEmail(variables.email);
      setStep("reset");
    },
    onError: (error: AxiosError) => {
      const err = error.response?.data as { message?: string };
      setServerError(err?.message || "Something went wrong. Please try again.");
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ResetForm) => {
      const res = await axios.post(
        `${frontendEnv.apiUrl}/auth/api/reset-password-seller`,
        { email, otp: data.otp, newPassword: data.newPassword },
        { withCredentials: true },
      );
      return res.data;
    },
    onSuccess: () => {
      setServerError(null);
      router.push("/login");
    },
    onError: (error: AxiosError) => {
      const err = error.response?.data as { message?: string };
      setServerError(err?.message || "Failed to reset password. Please try again.");
    },
  });

  const onSendOtp = emailForm.handleSubmit((data) => {
    setServerError(null);
    sendOtpMutation.mutate(data);
  });

  const onReset = resetForm.handleSubmit((data) => {
    if (data.newPassword !== data.confirmPassword) {
      resetForm.setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }
    setServerError(null);
    resetMutation.mutate(data);
  });

  return (
    <AuthLayout
      title="Merchant Hub"
      subtitle="Reset your account password"
      accentColor="emerald"
    >
      <div className="mb-10">
        <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tight">
          {step === "email" ? "Forgot Password" : "Reset Password"}
        </h3>
        <p className="text-slate-500 text-sm font-medium italic">
          {step === "email"
            ? "Enter your email to receive a one-time code"
            : `Enter the 6-digit code sent to ${email}`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === "email" ? (
          <motion.form
            key="email-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={onSendOtp}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Work Email
              </label>
              <input
                type="email"
                placeholder="merchant@fishstudio.com"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-600 text-white font-medium"
                {...emailForm.register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {emailForm.formState.errors.email && (
                <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl"
                >
                  <p className="text-rose-500 text-xs font-bold text-center italic uppercase tracking-wider">
                    {serverError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={!emailForm.formState.isValid || sendOtpMutation.isPending}
                isLoading={sendOtpMutation.isPending}
                loaderLabel="Sending Code..."
                variant="emerald"
              >
                Send Reset Code
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.form
            key="reset-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={onReset}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                6-Digit OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-600 text-white font-medium tracking-[0.4em] text-center text-xl"
                {...resetForm.register("otp", {
                  required: "OTP is required",
                  pattern: { value: /^\d{6}$/, message: "Enter the 6-digit code" },
                })}
              />
              {resetForm.formState.errors.otp && (
                <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1">
                  {resetForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-600 text-white font-medium"
                  {...resetForm.register("newPassword", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {resetForm.formState.errors.newPassword && (
                  <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Confirm Password
              </label>
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-600 text-white font-medium"
                {...resetForm.register("confirmPassword", {
                  required: "Please confirm your password",
                })}
              />
              {resetForm.formState.errors.confirmPassword && (
                <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1">
                  {resetForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl"
                >
                  <p className="text-rose-500 text-xs font-bold text-center italic uppercase tracking-wider">
                    {serverError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                disabled={!resetForm.formState.isValid || resetMutation.isPending}
                isLoading={resetMutation.isPending}
                loaderLabel="Resetting Password..."
                variant="emerald"
              >
                Reset Password
              </Button>
              <button
                type="button"
                onClick={() => { setStep("email"); setServerError(null); }}
                className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Back
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-10 pt-8 border-t border-white/5 text-center">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
          Remember your password?{" "}
          <Link href="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors ml-1">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
