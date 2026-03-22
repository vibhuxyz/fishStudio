"use client";

import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, ShoppingBag, UserCog } from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { frontendEnv } from "@/config/env";
import CreateShop from "../../../shared/modules/auth/create-shop";

type AccountRole = "seller" | "staff" | null;

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState<AccountRole>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerData, setSellerData] = useState<any | null>(null);
  const [sellerId, setSellerId] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const startResendTimer = () => {
    setCanResend(false);
    setTimer(60);
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

  const registrationEndpoint =
    selectedRole === "staff"
      ? "/auth/api/staff-registration"
      : "/auth/api/seller-registration";

  const verifyEndpoint =
    selectedRole === "staff"
      ? "/auth/api/verify-staff"
      : "/auth/api/verify-seller";

  const signupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(
        `${frontendEnv.apiUrl}${registrationEndpoint}`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const response = await axios.post(
        `${frontendEnv.apiUrl}${verifyEndpoint}`,
        {
          ...sellerData,
          otp: otp.join(""),
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (selectedRole === "staff") {
        // Staff signup complete — redirect to login
        window.location.href = "/login";
      } else {
        setSellerId(data?.seller?.id);
        setActiveStep(2);
      }
    },
  });

  const onSubmit = (data: any) => {
    signupMutation.mutate(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (sellerData) {
      signupMutation.mutate(sellerData);
    }
  };

  // ── Step 0: Role selection ──────────────────────────────────────────────────
  if (!selectedRole) {
    return (
      <div className="w-full bg-[#f1f1f1] flex flex-col items-center pt-16 min-h-screen">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 text-center">
          Create an Account
        </h1>
        <p className="text-gray-500 mb-10 text-center">
          Choose your account type to get started
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Seller card */}
          <button
            type="button"
            onClick={() => setSelectedRole("seller")}
            className="group w-72 bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-4 border-2 border-transparent hover:border-blue-600 transition-all"
          >
            <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
              <ShoppingBag className="text-blue-600" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Seller</h2>
            <p className="text-sm text-gray-500 text-center">
              I own a shop and want to manage orders, products, and staff.
            </p>
          </button>

          {/* Staff card */}
          <button
            type="button"
            onClick={() => setSelectedRole("staff")}
            className="group w-72 bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-4 border-2 border-transparent hover:border-green-600 transition-all"
          >
            <div className="w-16 h-16 bg-green-50 group-hover:bg-green-100 rounded-full flex items-center justify-center transition-colors">
              <UserCog className="text-green-600" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Staff</h2>
            <p className="text-sm text-gray-500 text-center">
              I work for a seller and need to manage and process shop orders.
            </p>
          </button>
        </div>
        <p className="mt-8 text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium">
            Login
          </Link>
        </p>
      </div>
    );
  }

  const isStaffFlow = selectedRole === "staff";

  return (
    <div className="w-full bg-[#f1f1f1] flex flex-col items-center pt-10 min-h-screen">
      {/* Role badge */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isStaffFlow
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {isStaffFlow ? "Staff Account" : "Seller Account"}
        </span>
        <button
          type="button"
          onClick={() => setSelectedRole(null)}
          className="text-sm text-gray-400 underline hover:text-gray-600"
        >
          Change
        </button>
      </div>

      {/* Stepper — only for seller */}
      {!isStaffFlow && (
        <div className="relative flex items-center justify-between md:w-[50%] mb-8">
          <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 z-10" />
          {[1, 2].map((step) => (
            <div key={step}>
              <div
                className={`w-10 h-10 relative z-20 flex items-center justify-center rounded-full text-white font-bold ${
                  step <= activeStep ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                {step}
              </div>
              <span className="ml-[-15px]">
                {step === 1 ? "Create Account" : "Setup Shop"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Form card */}
      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {(activeStep === 1 || isStaffFlow) && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-2xl font-semibold text-center mb-4">
                  {isStaffFlow ? "Create Staff Account" : "Create Account"}
                </h3>

                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">
                    {String(errors.name.message)}
                  </p>
                )}

                <label className="block text-gray-700 mb-1 mt-2">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
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
                  <p className="text-red-500 text-sm">
                    {String(errors.email.message)}
                  </p>
                )}

                {/* Phone number only for seller */}
                {!isStaffFlow && (
                  <>
                    <label className="block text-gray-700 mb-1 mt-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
                      {...register("phone_number", {
                        required: "Phone Number is required",
                        pattern: {
                          value: /^\+?[1-9]\d{1,14}$/,
                          message: "Invalid phone number format",
                        },
                      })}
                    />
                    {errors.phone_number && (
                      <p className="text-red-500 text-sm">
                        {String(errors.phone_number.message)}
                      </p>
                    )}
                  </>
                )}

                <label className="block text-gray-700 mb-1 mt-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
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
                  {signupMutation.isPending ? "Sending OTP..." : "Continue"}
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
                  <Link href="/login" className="text-blue-600">
                    Login
                  </Link>
                </p>
              </form>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Enter OTP
                </h3>
                <p className="text-center text-sm text-gray-500 mb-4">
                  We sent a code to{" "}
                  <span className="font-medium">{sellerData?.email}</span>
                </p>
                <div className="flex justify-center gap-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      ref={(el) => {
                        if (el) inputRefs.current[index] = el;
                      }}
                      maxLength={1}
                      className="w-12 h-12 text-center border border-gray-300 outline-none rounded"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                  ))}
                </div>
                <button
                  className="w-full mt-4 text-lg cursor-pointer bg-blue-600 text-white py-2 rounded-lg"
                  disabled={verifyOtpMutation.isPending}
                  onClick={() => verifyOtpMutation.mutate()}
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                </button>

                {isStaffFlow && (
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    After signing up, you will need a seller to grant you access
                    before you can log in.
                  </p>
                )}

                <p className="text-center text-sm mt-4">
                  {canResend ? (
                    <button
                      onClick={resendOtp}
                      className="text-blue-500 cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    `Resend OTP in ${timer}s`
                  )}
                </p>
                {verifyOtpMutation?.isError &&
                  verifyOtpMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {verifyOtpMutation.error.response?.data?.message ||
                        verifyOtpMutation.error.message}
                    </p>
                  )}
              </div>
            )}
          </>
        )}
        {!isStaffFlow && activeStep === 2 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}
      </div>
    </div>
  );
};

export default Signup;
