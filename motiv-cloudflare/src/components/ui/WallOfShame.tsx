"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Flame } from "lucide-react";

interface ShameEvent {
  id: number;
  name: string;
  amount: number;
  habit: string;
  time: string;
}

export default function WallOfShame() {
  const [events, setEvents] = useState<ShameEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBurns() {
      try {
        const res = await fetch("/api/wall-of-shame");
        if (res.ok) {
          const data: any = await res.json();
          const mapped = (data.burns || []).map((b: any, i: number) => ({
            id: i,
            name: b.name || `MOTIVated-${b.user_id}`,
            amount: b.daily_amount || 0,
            habit: b.habit_type || "habit",
            time: b.verified_at ? timeAgo(b.verified_at) : "",
          }));
          setEvents(mapped);
        }
      } catch {}
      setLoading(false);
    }
    fetchBurns();
    const interval = setInterval(fetchBurns, 30000);
    return () => clearInterval(interval);
  }, []);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-500" />
          <span className="text-sm font-bold text-stone-900">Live Burns</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[10px] text-red-500 font-bold">LIVE</span>
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <p className="text-xs text-stone-400 text-center py-4">Loading...</p>
        ) : events.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-stone-500 font-medium">No burns yet</p>
            <p className="text-xs text-stone-400 mt-1">People who miss their commitments will show up here.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700">
                    <span className="font-bold">{event.name}</span>
                    {" "}lost{" "}
                    <span className="text-red-500 font-black">₹{event.amount}</span>
                  </p>
                </div>
                <span className="text-[10px] text-stone-400 font-medium shrink-0">{event.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
