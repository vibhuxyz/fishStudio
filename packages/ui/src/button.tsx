"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  isLoading?: boolean;
  loaderLabel?: string;
  variant?: "blue" | "emerald" | "rose" | "indigo" | "amber";
  glow?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  isLoading = false,
  loaderLabel,
  variant = "blue",
  glow = true,
  fullWidth = true,
  disabled,
  className = "",
  type = "button",
  ...props
}: ButtonProps) => {
  const isActuallyDisabled = disabled || isLoading;

  const variants = {
    blue: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 text-white border-blue-400/20",
    emerald: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 text-white border-emerald-500/20",
    rose: "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20 text-white border-rose-400/20",
    indigo: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 text-white border-indigo-400/20",
    amber: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20 text-white border-amber-400/20",
  };

  const glowStyles = glow ? "shadow-lg group-hover:shadow-xl transition-shadow" : "";

  return (
    <motion.button
      whileHover={!isActuallyDisabled ? { scale: 1.01 } : {}}
      whileTap={!isActuallyDisabled ? { scale: 0.98 } : {}}
      type={type}
      disabled={isActuallyDisabled}
      className={`
        relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl 
        text-sm font-black uppercase tracking-[0.2em] transition-all duration-300
        border backdrop-blur-sm group
        ${fullWidth ? "w-full" : "w-auto"}
        ${variants[variant]}
        ${glowStyles}
        ${isActuallyDisabled ? "opacity-40 grayscale cursor-not-allowed border-white/5" : "cursor-pointer"}
        ${className}
      `}
      {...props}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            {loaderLabel && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-black italic text-[10px] tracking-widest uppercase"
              >
                {loaderLabel}
              </motion.span>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Shine Effect on Hover */}
      {!isActuallyDisabled && (
        <span className="absolute inset-0 overflow-hidden rounded-2xl">
          <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        </span>
      )}
    </motion.button>
  );
};
