"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import AuthLayout from "@/shared/components/layout/AuthLayout";
import StaffPwaMeta from "@/shared/components/staff-pwa-meta";

type FormData = {
  username: string;
  password: string;
};

const StaffLogin = () => {
  const { setLoggedIn, setRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({ mode: "onChange" });

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        "/auth/api/staff/login",
        data,
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setServerError(null);
      setLoggedIn(true);
      setRole("staff");
      queryClient.invalidateQueries({ queryKey: ["seller"] });

      if (data.user.role === "RIDER") {
        router.push("/staff/rider");
      } else if (data.user.role === "CUTTING_STAFF") {
        router.push("/staff/cutting");
      } else {
        router.push("/staff/orders");
      }
    },
    onError: (error: AxiosError) => {
      const errorData = error.response?.data as { message?: string };
      setServerError(errorData?.message || "Invalid username or password!");
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <AuthLayout title="Staff Login" subtitle="Sign in to manage your assigned orders" accentColor="blue">
      <StaffPwaMeta />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Username</label>
          <input
            type="text"
            placeholder="rider01"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition"
            {...register("username", { required: "Username is required" })}
          />
          {errors.username && (
            <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="********"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white outline-none focus:border-blue-500 transition"
              {...register("password", { required: "Password is required" })}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-red-400 text-sm text-center">{serverError}</p>}

        <button
          type="submit"
          disabled={!isValid || loginMutation.isPending}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition"
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default StaffLogin;
