"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../../store/authStore";
import { adminQueryKeys } from "@/hooks/useAdminQueries";
import { frontendEnv } from "@/config/env";

type SignupFormData = {
  name: string;
  email: string;
  password: string;
};

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [adminData, setAdminData] = useState<SignupFormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setLoggedIn } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const response = await axios.post(
        `${frontendEnv.apiUrl}/auth/api/admin-registration`,
        data,
      );

      return response.data;
    },
    onSuccess: (_, formData) => {
      setAdminData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!adminData) return;

      const response = await axios.post(
        `${frontendEnv.apiUrl}/auth/api/verify-admin`,
        {
          ...adminData,
          otp: otp.join(""),
        },
        { withCredentials: true },
      );

      return response.data;
    },
    onSuccess: async () => {
      setLoggedIn(true);
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.account });
      router.push("/dashboard");
    },
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (adminData) {
      signupMutation.mutate(adminData);
    }
  };

  return (
    <div className="w-full bg-[#f1f1f1] flex flex-col items-center pt-10 min-h-screen">
      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {!showOtp ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <h3 className="text-2xl font-semibold text-center mb-4">
              Create Admin Account
            </h3>

            <label className="block text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="Admin name"
              className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
              {...register("name", {
                required: "Name is required",
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
            )}

            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="admin@fishstudio.com"
              className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value:
                    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{String(errors.email.message)}</p>
            )}

            <label className="block text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Min. 6 characters"
                className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
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
                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
              >
                {passwordVisible ? <Eye /> : <EyeOff />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">
                {String(errors.password.message)}
              </p>
            )}

            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg"
            >
              {signupMutation.isPending ? "Sending OTP..." : "Signup"}
            </button>

            {signupMutation.isError &&
              signupMutation.error instanceof AxiosError && (
                <p className="text-red-500 text-sm mt-2">
                  {signupMutation.error.response?.data?.message ||
                    signupMutation.error.message}
                </p>
              )}

            <p className="pt-3 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-red-500">
                Login
              </Link>
            </p>
          </form>
        ) : (
          <div>
            <h3 className="text-xl font-semibold text-center mb-4">
              Enter OTP
            </h3>
            <p className="text-center text-sm text-gray-500 mb-4">
              We sent a verification code to {adminData?.email}
            </p>
            <div className="flex justify-center gap-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  maxLength={1}
                  className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
                  value={digit}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                />
              ))}
            </div>

            <button
              className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
              disabled={verifyOtpMutation.isPending}
              onClick={() => verifyOtpMutation.mutate()}
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="text-center text-sm mt-4">
              {canResend ? (
                <button onClick={resendOtp} className="text-blue-500 cursor-pointer">
                  Resend OTP
                </button>
              ) : (
                `Resend OTP in ${timer}s`
              )}
            </p>

            {verifyOtpMutation.isError &&
              verifyOtpMutation.error instanceof AxiosError && (
                <p className="text-red-500 text-sm mt-2">
                  {verifyOtpMutation.error.response?.data?.message ||
                    verifyOtpMutation.error.message}
                </p>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
