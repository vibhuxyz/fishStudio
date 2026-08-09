"use client";

import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, ShoppingBag, UserCog, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import CreateShop from "../../../shared/modules/auth/create-shop";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "@/shared/components/layout/AuthLayout";
import StepIndicator from "@/shared/components/ui/StepIndicator";
import { Button } from "@repo/ui";

// Signup is merchants only. Staff (order manager, rider, cutting staff) are
// created by their seller from Dashboard → Staff Management, which sets the
// username and password they sign in with at /staff/login.
const Signup = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(120);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerData, setSellerData] = useState<any | null>(null);
  const [sellerId, setSellerId] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Seller Verification ---
  const [accessCode, setAccessCode] = useState("");
  const [codeVerifiedEmail, setCodeVerifiedEmail] = useState(""); 
  const [codeVerified, setCodeVerified] = useState(false);

  // wizard steps calculation
  const steps = ["Identity", "OTP", "Shop"];
  const currentStep = activeStep === 2 ? 3 : showOtp ? 2 : 1;

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const response = await axios.post(
        "/auth/api/verify-seller-code",
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      setCodeVerified(true);
      setCodeVerifiedEmail(variables.email);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });

  const startResendTimer = () => {
    setCanResend(false);
    setTimer(120);
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
    mutationFn: async (data: any) => {
      const response = await axios.post("/auth/api/seller-registration", {
        ...data,
        code: accessCode,
      });
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
        "/auth/api/verify-seller",
        { ...sellerData, otp: otp.join(""), code: accessCode },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setActiveStep(2);
    },
  });

  const onSubmit = (data: any) => {
    if (codeVerified) {
      data.email = codeVerifiedEmail;
    }
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

  const accentColor = "emerald";

  return (
    <AuthLayout 
      title="Merchant Link"
      subtitle="Establishing your commercial matrix"
      accentColor={accentColor}
      topContent={
        <StepIndicator currentStep={currentStep} steps={steps} accentColor={accentColor} />
      }
    >
       <div className="pt-2">
          {/* Step 1 is now the first screen (the role chooser is gone), so
              there is nothing to go back to until the shop step. */}
          {activeStep !== 1 && (
            <button
              onClick={() => setActiveStep(1)}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest mb-8 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Previous State
            </button>
          )}

          {activeStep === 2 ? (
            <div className="animate-in fade-in zoom-in duration-700">
               <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeStep === 1 && !codeVerified ? (
                <motion.div 
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">Authorization</h3>
                    <p className="text-slate-500 text-sm font-medium italic">Enter master code to unlock merchant node.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Work Email</label>
                        <input
                          type="email"
                          placeholder="merchant@fishstudio.com"
                          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-white font-medium"
                          value={codeVerifiedEmail}
                          onChange={(e) => setCodeVerifiedEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Access Key</label>
                      <input
                        type="text"
                        placeholder="000-000"
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-white font-mono uppercase tracking-[0.3em] font-black"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                      />
                    </div>
                    
                    <Button
                      onClick={() => verifyCodeMutation.mutate({ email: codeVerifiedEmail, code: accessCode })}
                      disabled={!accessCode || !codeVerifiedEmail || verifyCodeMutation.isPending}
                      isLoading={verifyCodeMutation.isPending}
                      loaderLabel="Validating Protocol..."
                      variant="emerald"
                    >
                      Connect Node
                    </Button>
                    
                    {verifyCodeMutation.isError && (
                      <p className="text-rose-500 text-[10px] font-black text-center italic uppercase leading-tight">
                        { (verifyCodeMutation.error as any)?.response?.data?.message || "Protocol Error: Invalid Access Key" }
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : !showOtp ? (
                <motion.form 
                  key="identity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit(onSubmit)} 
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">Identity Matrix</h3>
                    <p className="text-slate-500 text-sm font-medium italic">Defining your professional operative profile.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="Operative Name"
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-white font-medium"
                        {...register("name", { required: "Name is required" })}
                      />
                    </div>

                    {!codeVerified && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Work Email</label>
                        <input
                          type="email"
                          placeholder="you@fishstudio.com"
                          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-white font-medium"
                          {...register("email", { required: "Email is required" })}
                        />
                      </div>
                    )}

                    {codeVerified && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Verified Link</label>
                        <div className="w-full px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold flex items-center justify-between backdrop-blur-md">
                          <span className="text-sm italic">{codeVerifiedEmail}</span>
                          <CheckCircle2 size={18} className="animate-pulse" />
                        </div>
                      </div>
                    )}

                    {(
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Comms Number</label>
                        <input
                          type="tel"
                          placeholder="+91 00000 00000"
                          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-white font-medium"
                          maxLength={10}
                          {...register("phone_number", { required: "Required" })}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Access Password</label>
                      <div className="relative group">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-white font-medium"
                          {...register("password", { required: "Required", minLength: 6 })}
                        />
                        <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                          {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={!isValid || signupMutation.isPending}
                      isLoading={signupMutation.isPending}
                      loaderLabel="Starting Uplink..."
                      variant={accentColor as any}
                    >
                      Initialize Profile
                    </Button>
                    
                    {signupMutation.isError && (
                      <p className="text-rose-500 text-[10px] font-black text-center italic uppercase leading-tight">
                        { (signupMutation.error as any)?.response?.data?.message || "Transmission Failure" }
                      </p>
                    )}
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="otp"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">OTP Verification</h3>
                    <p className="text-slate-500 text-sm font-medium italic">Security code sent to <span className="text-white font-bold">{sellerData?.email}</span></p>
                  </div>

                  <div className="flex justify-center gap-4 py-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        ref={(el) => { if (el) inputRefs.current[index] = el; }}
                        maxLength={1}
                        className={`w-16 h-20 text-center text-3xl font-black bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 ${accentColor === "emerald" ? "focus:ring-emerald-500/20 focus:border-emerald-500" : "focus:ring-blue-500/20 focus:border-blue-500"} transition-all text-white backdrop-blur-xl`}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      />
                    ))}
                  </div>

                  <div className="space-y-6">
                    <Button
                      disabled={otp.some(d => !d) || verifyOtpMutation.isPending}
                      isLoading={verifyOtpMutation.isPending}
                      loaderLabel="Validating System..."
                      onClick={() => verifyOtpMutation.mutate()}
                      variant={accentColor as any}
                    >
                      Synchronize System
                    </Button>

                    <div className="text-center">
                      {canResend ? (
                        <button onClick={resendOtp} className={`text-[10px] font-black uppercase tracking-widest ${accentColor === "emerald" ? "text-emerald-500" : "text-blue-500"} hover:underline underline-offset-4 decoration-current transition-all`}>Request New Transmission</button>
                      ) : (
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic font-medium">Re-transmission available in <span className="text-white font-bold">{timer}s</span></p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
       </div>
    </AuthLayout>
  );
};

export default Signup;
