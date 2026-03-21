"use client";

import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

type ComingSoonProps = {
  emoji: string;
  title: string;
};

export default function ComingSoon({ emoji, title }: ComingSoonProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B0F] flex items-center justify-center">
      {/* Animated background blobs */}
      <motion.div
        animate={{ x: [0, 80, 0], y: [0, -60, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-72 h-72 bg-purple-600/30 blur-3xl rounded-full"
      />

      <motion.div
        animate={{ x: [0, -100, 0], y: [0, 80, 0] }}
        transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full"
      />

      {/* Main Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-6"
      >
        {/* Custom Emoji */}
        <motion.div
          variants={item}
          animate={{ y: [0, -12, 0], rotate: [0, 2, -2, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-7xl mb-6 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"
        >
          {emoji}⚡
        </motion.div>

        {/* Badge */}
        <motion.div
          variants={item}
          className="inline-block mb-6 px-4 py-1 rounded-full text-sm font-medium
          bg-white/10 text-white backdrop-blur"
        >
          🚧 Work in Progress
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={item}
          className="text-5xl md:text-6xl font-extrabold mb-6
          bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400
          bg-clip-text text-transparent"
        >
          {title}
          <br />
          Is Coming Soon
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={item}
          className="text-gray-300 text-lg max-w-xl mx-auto mb-10"
        >
          We’re crafting a next-level experience with performance, design,
          and scalability at its core.  
          Launching very soon 🚀
        </motion.p>

        {/* Animated Divider */}
        <motion.div
          variants={item}
          initial={{ width: 0 }}
          animate={{ width: 160 }}
          transition={{ duration: 0.8 }}
          className="h-[2px] bg-gradient-to-r from-purple-500 to-cyan-400 mx-auto rounded-full"
        />

        {/* Footer text */}
        <motion.p
          variants={item}
          className="mt-10 text-sm text-gray-500"
        >
          Stay tuned — big things are loading…
        </motion.p>
      </motion.div>
    </div>
  );
}
