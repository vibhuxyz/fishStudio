"use client";

import { useState, useEffect } from "react";
import { endOfListMessages } from "@repo/shared/data";
import { motion, AnimatePresence } from "framer-motion";

export function EndOfListBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % endOfListMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentMessage = endOfListMessages[currentIndex] || { text: "", emoji: "" };

  return (
    <div className="mt-8 flex justify-center w-full px-4 mb-8">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 p-[1px] text-center max-w-2xl w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] group transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
        {/* Animated moving gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse"></div>
        
        <div className="relative bg-white dark:bg-slate-900 rounded-[31px] px-8 py-10 h-full flex flex-col items-center justify-center overflow-hidden">
          
          {/* Subtle background animated blobs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-48 h-48 bg-purple-200 dark:bg-purple-900/40 rounded-full blur-3xl opacity-50"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -right-20 w-48 h-48 bg-pink-200 dark:bg-pink-900/40 rounded-full blur-3xl opacity-50"
          />

          <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-6">
            You've reached the bottom
          </h3>
          
          <div className="min-h-[140px] flex items-center justify-center w-full relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", delay: 0.1, bounce: 0.6 }}
                  className="text-5xl drop-shadow-md"
                >
                  {currentMessage.emoji}
                </motion.div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold text-lg sm:text-xl leading-relaxed max-w-lg">
                  {currentMessage.text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div 
            className="mt-6 w-12 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-80"
          />
        </div>
      </div>
    </div>
  );
}
