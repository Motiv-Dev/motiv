"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { sounds } from "@/lib/sounds";

export default function SoundToggle() {
  const { soundEnabled, toggleSound } = useAppStore();

  return (
    <button
      onClick={() => {
        toggleSound();
        if (!soundEnabled) sounds.click();
      }}
      className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
      aria-label="Toggle sound"
    >
      {soundEnabled ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
    </button>
  );
}
