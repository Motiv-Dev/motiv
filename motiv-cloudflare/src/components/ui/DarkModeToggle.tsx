"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useAppStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <button
      onClick={toggleDarkMode}
      className="relative w-14 h-7 rounded-full bg-stone-200 dark:bg-stone-700 transition-colors duration-300 flex items-center p-1"
      aria-label="Toggle dark mode"
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center"
        animate={{ x: darkMode ? 26 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {darkMode ? (
          <Moon className="w-3 h-3 text-stone-600" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </motion.div>
    </button>
  );
}
