"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/bg-coming-soon.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 text-center px-6"
      >
        {/* 404 */}
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-7xl md:text-8xl font-extrabold text-white mb-4 tracking-wider"
        >
          404
        </motion.h1>

        {/* Floating emoji */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl mb-4"
        >
          🚧✨
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-semibold text-white mb-3"
        >
          Page Coming Soon
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-300 max-w-xl mx-auto text-lg"
        >
          We’re working on this page and crafting something awesome. Please
          check back again shortly 🚀
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 180 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="h-[2px] bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mt-8 rounded-full"
        />

        {/* Back Button (go to previous page) */}
        <motion.button
          onClick={() => router.back()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-10 px-6 py-3 rounded-full
          bg-white/10 text-white backdrop-blur
          hover:bg-white/20 transition cursor-pointer"
        >
          ← Go Back
        </motion.button>
      </motion.div>
    </div>
  );
}
