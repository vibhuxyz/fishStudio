"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../../store/authStore";
import Link from "next/link";
import { frontendEnv } from "@/config/env";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@repo/ui";

type FormData = {
  email: string;
  password: string;
};

import AuthLayout from "@/shared/components/layout/AuthLayout";
import { TestAccounts } from "@/shared/components/login/TestAccounts";
import { testAccounts } from "@/shared/components/login/data";


const Login = () => {
  const { setLoggedIn, setRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: "onChange",
  });

  const handleTestAccountSelect = (account: any) => {
    setValue("email", account.email, { shouldValidate: true });
    setValue("password", account.password, { shouldValidate: true });
  };


  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${frontendEnv.apiUrl}/auth/api/login-seller`,
        data,
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setServerError(null);
      setLoggedIn(true);
      const role = data.role as "seller" | "staff";
      setRole(role);
      queryClient.invalidateQueries({ queryKey: ["seller"] });

      if (role === "staff") {
        router.push("/staff/orders");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: AxiosError) => {
      const errorData = error.response?.data as {
        message?: string;
        success?: boolean;
      };
      setServerError(errorData?.message || "Invalid credentials!");
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <AuthLayout 
      title="Merchant Hub" 
      subtitle="Securely access your shop & order workstation"
      accentColor="emerald"
    >
      <div className="mb-10">
        <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tight">
          Welcome Back
        </h3>
        <p className="text-slate-500 text-sm font-medium italic">
          Enter your merchant credentials to proceed
        </p>
      </div>

      <TestAccounts accounts={testAccounts} onSelect={handleTestAccountSelect} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
            Work Email
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="merchant@fishstudio.com"
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-600 text-white font-medium"
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
          <div className="flex justify-between items-center px-1">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Security Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors underline underline-offset-4 decoration-emerald-500/30"
            >
              Recover
            </Link>
          </div>
          <div className="relative group">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-600 text-white font-medium"
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
                    loaderLabel="Establishing Session..."
                    variant="emerald"
                  >
                    Establish Session
                  </Button>
        </div>
      </form>


      <div className="mt-10 pt-8 border-t border-white/5 text-center">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
          New to the network?{" "}
          <Link
            href="/signup"
            className="text-emerald-500 hover:text-emerald-400 transition-colors ml-1"
          >
            Join Marketplace
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
