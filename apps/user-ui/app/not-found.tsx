"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8 h-64 w-64 overflow-hidden rounded-full border-8 border-primary/10 bg-muted shadow-2xl md:h-80 md:w-80"
      >
        <Image
          src="/404-fish.png"
          alt="404 - Fish Not Found"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="font-serif text-5xl font-bold tracking-tight text-foreground md:text-7xl"
      >
        404
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4 max-w-md"
      >
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
          Oops! This fish swam away.
        </h2>
        <p className="mt-4 text-muted-foreground md:text-lg">
          We can&apos;t seem to find the page you&apos;re looking for. It might
          have been moved, deleted, or perhaps it never existed in this sea.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go back home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full px-8">
          <Link href="/categories">
            <Search className="mr-2 h-4 w-4" />
            Browse Categories
          </Link>
        </Button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        onClick={() => window.history.back()}
        className="mt-8 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Go back to previous page
      </motion.button>
    </div>
  );
}
