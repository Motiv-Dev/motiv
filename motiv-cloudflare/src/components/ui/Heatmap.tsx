"use client";

import { motion } from "framer-motion";

interface HeatmapProps {
  proofs: Array<{
    day_number: number;
    status: string;
  }>;
  totalDays: number;
  startDate: string;
}

export default function Heatmap({ proofs, totalDays, startDate }: HeatmapProps) {
  const days = Array.from({ length: totalDays }, (_, i) => {
    const proof = proofs.find((p) => p.day_number === i + 1);
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const isPast = date < new Date();

    let status = "future";
    if (proof?.status === "approved") status = "completed";
    else if (proof?.status === "rejected" || proof?.status === "missed") status = "missed";
    else if (proof?.status === "submitted") status = "pending";
    else if (isPast) status = "missed";

    return { day: i + 1, status, date };
  });

  const getColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500 shadow-emerald-500/30";
      case "missed": return "bg-red-500 shadow-red-500/30";
      case "pending": return "bg-amber-400 shadow-amber-400/30";
      case "future": return "bg-stone-100 border border-stone-200";
      default: return "bg-stone-100";
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {days.map((d, i) => (
          <motion.div
            key={d.day}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
            className="relative group"
          >
            <div className={`w-7 h-7 rounded-md ${getColor(d.status)} shadow-sm flex items-center justify-center cursor-default transition-transform hover:scale-125`}>
              <span className="text-[9px] font-bold text-white/80">{d.day}</span>
            </div>

            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none">
              <div className="bg-stone-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                Day {d.day} • {d.status}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4">
        {[
          { label: "Completed", color: "bg-emerald-500" },
          { label: "Missed", color: "bg-red-500" },
          { label: "Pending", color: "bg-amber-400" },
          { label: "Upcoming", color: "bg-stone-100 border border-stone-200" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${l.color}`} />
            <span className="text-[10px] text-stone-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
