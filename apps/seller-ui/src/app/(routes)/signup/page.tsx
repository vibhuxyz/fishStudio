"use client";

import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, ShoppingBag, UserCog, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { frontendEnv } from "@/config/env";
import CreateShop from "../../../shared/modules/auth/create-shop";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "@/shared/components/layout/AuthLayout";
import StepIndicator from "@/shared/components/ui/StepIndicator";
import { Button } from "@repo/ui";

type AccountRole = "seller" | "staff" | null;

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState<AccountRole>(null);
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
  const isSeller = selectedRole === "seller";
  const steps = isSeller 
    ? ["Role", "Identity", "OTP", "Shop"] 
    : ["Role", "Identity", "OTP", "Done"];
  
  const currentStep = !selectedRole ? 1 
    : (activeStep === 2 ? 4 
    : (showOtp ? 3 : 2));

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const response = await axios.post(
        `${frontendEnv.apiUrl}/auth/api/verify-seller-code`,
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
      const payload = selectedRole === "seller" ? { ...data, code: accessCode } : data;
      const response = await axios.post(
        `${frontendEnv.apiUrl}${registrationEndpoint}`,
        payload,
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
      const payload = selectedRole === "seller" ? { ...sellerData, otp: otp.join(""), code: accessCode } : { ...sellerData, otp: otp.join("") };
      const response = await axios.post(
        `${frontendEnv.apiUrl}${verifyEndpoint}`,
        payload,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (selectedRole === "staff") {
        window.location.href = "/login";
      } else {
        setSellerId(data?.seller?.id);
        setActiveStep(2);
      }
    },
  });

  const onSubmit = (data: any) => {
    if (selectedRole === "seller" && codeVerified) {
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

  const accentColor = selectedRole === "staff" ? "blue" : "emerald";
  const isStaffFlow = selectedRole === "staff";

  if (!selectedRole) {
    return (
      <div className="w-full min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-inter">
        {/* Dynamic Background Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[100px]" 
        />

        <div className="w-full max-w-[800px] z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                Network Enrollment
              </span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
              Join the ecosystem
            </h1>
            <p className="text-slate-500 mt-4 font-medium italic text-lg opacity-80">
              Select your operational bridge to begin
            </p>
          </motion.div>

          <StepIndicator currentStep={1} steps={["Role", "Identity", "OTP", "Shop"]} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl shadow-black/50 overflow-visible p-4">
            <motion.button
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole("seller")}
              className="group bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-2xl text-center flex flex-col items-center gap-8 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0 shadow-2xl">
                <ShoppingBag size={48} />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Merchant</h2>
                <p className="text-slate-500 text-sm font-medium italic leading-relaxed">
                  Establish your shop, scale your inventory, and lead business operations.
                </p>
              </div>
              <div className="mt-4 py-3 px-8 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                Initiate Merchant Flow
              </div>
            </motion.button>

            <motion.button
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole("staff")}
              className="group bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-2xl text-center flex flex-col items-center gap-8 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="w-24 h-24 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 -rotate-3 group-hover:rotate-0 shadow-2xl">
                <UserCog size={48} />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Associate</h2>
                <p className="text-slate-500 text-sm font-medium italic leading-relaxed">
                  Connect to an existing shop and manage order fulfillment streams.
                </p>
              </div>
              <div className="mt-4 py-3 px-8 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                Initiate Associate Flow
              </div>
            </motion.button>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
              Legacy operative?{" "}
              <Link href="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors ml-1 underline underline-offset-4 decoration-emerald-500/20">
                Resurrect Session
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout 
      title={isSeller ? "Merchant Link" : "Associate Link"}
      subtitle={isSeller ? "Establishing your commercial matrix" : "Connecting to shop operational stream"}
      accentColor={accentColor}
      topContent={
        <StepIndicator currentStep={currentStep} steps={steps} accentColor={accentColor} />
      }
    >
       <div className="pt-2">
          <button
            onClick={() => {
              if (activeStep === 1) setSelectedRole(null);
              else setActiveStep(1);
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest mb-8 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Previous State
          </button>

          {!isStaffFlow && activeStep === 2 ? (
            <div className="animate-in fade-in zoom-in duration-700">
               <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {selectedRole === "seller" && activeStep === 1 && !codeVerified ? (
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

                    {(!codeVerified || isStaffFlow) && (
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

                    {selectedRole === "seller" && codeVerified && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Verified Link</label>
                        <div className="w-full px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold flex items-center justify-between backdrop-blur-md">
                          <span className="text-sm italic">{codeVerifiedEmail}</span>
                          <CheckCircle2 size={18} className="animate-pulse" />
                        </div>
                      </div>
                    )}

                    {!isStaffFlow && (
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
