"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../../store/authStore";
import { adminQueryKeys } from "@/hooks/useAdminQueries";
import { frontendEnv } from "@/config/env";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@repo/ui";
import useSeller from "@/hooks/useSeller";
import { toast } from "sonner";
import { useEffect } from "react";

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const { setLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const { seller, isLoading: isProfileLoading } = useSeller();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: "onChange"
  });

  useEffect(() => {
    if (!isProfileLoading && seller) {
      toast.info("You are already logged in. Redirecting to dashboard...", {
        description: "Please logout to create another account",
        duration: 3000,
      });
      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);
    }
  }, [seller, isProfileLoading, router]);

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${frontendEnv.apiUrl}/auth/api/login-admin`,
        data,
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: async () => {
      setServerError(null);
      setLoggedIn(true);
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.account });
      router.push("/dashboard");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid credentials!";
      setServerError(errorMessage);
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Dynamic Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 60, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[100px]" 
      />

      <div className="w-full max-w-[460px] z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
              Administrative Control
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
            Master Console
          </h1>
          <p className="text-slate-500 mt-2 font-medium italic">
            Secure authentication for system operators
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden group"
        >
          {/* Card Accent */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative z-10">
            <div className="mb-10">
              <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tight">
                Welcome Back
              </h3>
              <p className="text-slate-500 text-sm font-medium italic">
                Enter your secure credentials to proceed
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="admin@fishstudio.com"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-600 text-white font-medium"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1">
                      {String(errors.email.message)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Secure Password
                </label>
                <div className="relative group">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-600 text-white font-medium"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && (
                    <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1">
                      {String(errors.password.message)}
                    </p>
                  )}
                </div>
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
                  disabled={!isValid || loginMutation.isPending}
                  isLoading={loginMutation.isPending}
                  loaderLabel="Decrypting..."
                  variant="blue"
                >
                  Authorize Session
                </Button>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Don&apos;t have access?{" "}
                <Link
                  href="/signup"
                  className="text-blue-500 hover:text-blue-400 transition-colors ml-1"
                >
                  Request Credentials
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] italic opacity-50"
        >
          Protected by Fish Studio Global Security Module
        </motion.p>
      </div>
    </div>
  );
};

export default Login;
