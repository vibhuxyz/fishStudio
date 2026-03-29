"use client";

import React from "react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  accentColor?: "blue" | "emerald";
  topContent?: React.ReactNode;
}

const AuthLayout = ({ children, title, subtitle, accentColor = "emerald", topContent }: AuthLayoutProps) => {
  const accentClasses = accentColor === "blue" ? "from-blue-500 to-indigo-600" : "from-emerald-500 to-teal-600";
  const glowClasses = accentColor === "blue" ? "bg-blue-600/20" : "bg-emerald-600/20";

  return (
    <div className="w-full min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Dynamic Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ${glowClasses} rounded-full blur-[120px]`}
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 60, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] ${glowClasses} rounded-full blur-[100px] shadow-2xl`}
      />

      <div className="w-full max-w-[480px] z-10 flex flex-col items-center">
        {/* Logo/Identity */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-md`}>
            <div className={`w-2 h-2 rounded-full bg-gradient-to-tr ${accentClasses} animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
              Fish Studio Digital Network
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-500 mt-2 font-medium italic text-lg leading-tight max-w-[320px] mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Step Indicator / Top Content Slot */}
        {topContent && (
          <div className="w-full mb-8">
            {topContent}
          </div>
        )}

        {/* Glassmorphism Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="w-full bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group"
        >
           {/* Card Inner Glow */}
           <div className={`absolute -top-12 -right-12 w-32 h-32 ${glowClasses} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
           
           <div className="relative z-10">
            {children}
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
