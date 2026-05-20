"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Skeleton loader components
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-stone-200 dark:bg-stone-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-lg w-3/4" />
          <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded-lg w-1/2" />
        </div>
      </div>
      <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full w-full mb-4" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-16 bg-stone-200 dark:bg-stone-700 rounded-lg" />
        <div className="h-16 bg-stone-200 dark:bg-stone-700 rounded-lg" />
        <div className="h-16 bg-stone-200 dark:bg-stone-700 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-700" />
        <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-20" />
      </div>
      <div className="h-7 bg-stone-200 dark:bg-stone-700 rounded w-16 mt-2" />
    </div>
  );
}
