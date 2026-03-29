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
import { motion, AnimatePresence } from "framer-motion";
import StepIndicator from "@/shared/components/ui/StepIndicator";
import { Button } from "@repo/ui";
import { toast } from "sonner";
import useSeller from "@/hooks/useSeller";
import { useEffect } from "react";

type SignupFormData = {
  name: string;
  email: string;
  password: string;
};

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(120);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [adminData, setAdminData] = useState<SignupFormData | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setLoggedIn } = useAuthStore();
  const { seller, isLoading: isProfileLoading } = useSeller();

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

  const currentStep = !codeVerified ? 1 : !showOtp ? 2 : 3;
  const steps = ["Authorization", "Profile", "Security"];

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<SignupFormData>({
    mode: "onChange"
  });

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
  
  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await axios.post(
        `${frontendEnv.apiUrl}/auth/api/admin/verifycode`,
        { code }
      );
      return response.data;
    },
    onSuccess: () => {
      setCodeVerified(true);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const response = await axios.post(
        `${frontendEnv.apiUrl}/auth/api/admin-registration`,
        { ...data, code: accessCode },
      );

      return response.data;
    },
    onSuccess: (_, formData) => {
      setAdminData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(120);
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
          code: accessCode,
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
    <div className="w-full min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Dynamic Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 60, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-15%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[100px]" 
      />

      <div className="w-full max-w-[520px] z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
              System Onboarding
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
            Operator Enrollment
          </h1>
          <p className="text-slate-500 mt-2 font-medium italic">
            Establishing master administrative credentials
          </p>
        </motion.div>

        <StepIndicator currentStep={currentStep} steps={steps} accentColor="blue" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden group"
        >
          {/* Card Accent */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative z-10">
            {!codeVerified ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">
                    Step 1: Authorization
                  </h3>
                  <p className="text-slate-500 text-sm font-medium italic">
                    Verify master access code to unlock registration.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Master Access Code
                    </label>
                    <input
                      type="text"
                      placeholder="ENTER_MASTER_KEY"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-600 text-white font-mono font-bold tracking-widest uppercase"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={() => verifyCodeMutation.mutate(accessCode)}
                    disabled={!accessCode || verifyCodeMutation.isPending}
                    isLoading={verifyCodeMutation.isPending}
                    loaderLabel="Validating..."
                    variant="blue"
                  >
                    Verify Access Code
                  </Button>

                  <AnimatePresence>
                    {verifyCodeMutation.isError &&
                      verifyCodeMutation.error instanceof AxiosError && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl"
                        >
                          <p className="text-rose-500 text-xs font-bold text-center italic uppercase tracking-wider">
                            {verifyCodeMutation.error.response?.data?.message ||
                              verifyCodeMutation.error.message}
                          </p>
                        </motion.div>
                      )}
                  </AnimatePresence>

                  <div className="pt-6 border-t border-white/5 text-center">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
                      Already registered?{" "}
                      <Link
                        href="/login"
                        className="text-blue-500 font-bold hover:text-blue-400 ml-1 transition-colors"
                      >
                        Sign In
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            ) : !showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">
                    Step 2: Profile Setup
                  </h3>
                  <p className="text-slate-500 text-sm font-medium italic">
                    Configure your administrative profile details.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Operator Display Name"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-600 text-white font-medium"
                      {...register("name", {
                        required: "Name is required",
                      })}
                    />
                    {errors.name && (
                      <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1">
                        {String(errors.name.message)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="admin@fishstudio.com"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-600 text-white font-medium"
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
                      <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1">
                        {String(errors.email.message)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Access Password
                    </label>
                    <div className="relative">
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
                        {passwordVisible ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1">
                        {String(errors.password.message)}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={!isValid || signupMutation.isPending}
                    isLoading={signupMutation.isPending}
                    loaderLabel="Transmitting..."
                    variant="blue"
                  >
                    Continue to Security
                  </Button>

                  <AnimatePresence>
                    {signupMutation.isError &&
                      signupMutation.error instanceof AxiosError && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl"
                        >
                          <p className="text-rose-500 text-xs font-bold text-center italic uppercase tracking-wider">
                            {signupMutation.error.response?.data?.message ||
                              signupMutation.error.message}
                          </p>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </div>
              </form>
            ) : (
              <div className="space-y-10">
                <div className="text-center">
                  <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">
                    Step 3: Verification
                  </h3>
                  <p className="text-slate-500 text-sm font-medium italic">
                    We sent a security code to <span className="text-white font-bold">{adminData?.email}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-4 py-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      maxLength={1}
                      className="w-16 h-20 text-center text-3xl font-black bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-white backdrop-blur-xl"
                      value={digit}
                      onChange={(event) =>
                        handleOtpChange(index, event.target.value)
                      }
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    />
                  ))}
                </div>

                <div className="space-y-6">
                  <Button
                    disabled={otp.some(d => !d) || verifyOtpMutation.isPending}
                    isLoading={verifyOtpMutation.isPending}
                    loaderLabel="Decrypting Code..."
                    onClick={() => verifyOtpMutation.mutate()}
                    variant="blue"
                  >
                    Complete Enrollment
                  </Button>

                  <div className="text-center">
                    {canResend ? (
                      <button
                        onClick={resendOtp}
                        className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-400 transition-all underline underline-offset-4"
                      >
                        Resend Security Code
                      </button>
                    ) : (
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
                        New code available in <span className="text-blue-500">{timer}s</span>
                      </p>
                    )}
                  </div>

                  <AnimatePresence>
                    {(verifyOtpMutation.isError || signupMutation.isError) && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl"
                      >
                        <p className="text-rose-500 text-[10px] font-bold text-center italic uppercase tracking-wider">
                          {(verifyOtpMutation.error as any)?.response?.data?.message ||
                            (signupMutation.error as any)?.response?.data?.message ||
                            "Verification failed. Integrity check compromised."}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
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

export default Signup;
