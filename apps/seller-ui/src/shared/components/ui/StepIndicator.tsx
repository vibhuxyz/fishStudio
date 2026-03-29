"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
  accentColor?: "blue" | "emerald";
}

const StepIndicator = ({ currentStep, steps, accentColor = "emerald" }: StepIndicatorProps) => {
  const activeBg = accentColor === "blue" ? "bg-blue-500" : "bg-emerald-500";
  const activeText = accentColor === "blue" ? "text-blue-400" : "text-emerald-400";
  const activeBorder = accentColor === "blue" ? "border-blue-500/50" : "border-emerald-500/50";

  return (
    <div className="w-full flex items-center justify-between mb-12 relative px-4">
      {/* Connector Line */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 z-0" />
      <motion.div 
        initial={{ width: "0%" }}
        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className={`absolute top-1/2 left-0 h-[3px] ${activeBg} shadow-[0_0_15px_rgba(16,185,129,0.4)] -translate-y-1/2 z-0`}
      />

      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <div key={step} className="relative z-10 flex flex-col items-center group">
            <motion.div 
              initial={false}
              animate={{ 
                scale: isActive ? 1.2 : 1,
                backgroundColor: isCompleted || isActive ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
                borderColor: isCompleted || isActive ? (accentColor === "blue" ? "#3b82f6" : "#10b981") : "rgba(255, 255, 255, 0.1)"
              }}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center backdrop-blur-xl transition-all duration-500`}
            >
              {isCompleted ? (
                <Check size={18} className="text-white" />
              ) : (
                <span className={`text-xs font-black ${isActive ? "text-white" : "text-white/40"}`}>
                  {stepNumber}
                </span>
              )}
              
              {/* Active Glow */}
              {isActive && (
                <motion.div 
                  layoutId="glow"
                  className={`absolute inset-0 rounded-full blur-md opacity-40 ${activeBg} animate-pulse`} 
                />
              )}
            </motion.div>
            
            <motion.span 
              animate={{ opacity: isActive || isCompleted ? 1 : 0.4 }}
              className={`absolute -bottom-7 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] italic ${isActive ? activeText : "text-white/40"} transition-colors duration-500`}
            >
              {step}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
