"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Flame } from "lucide-react";

export default function LeaderboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d: any) => setData(d.leaderboard || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <nav className="sticky top-0 z-50 bg-[#faf9f7]/80 backdrop-blur-xl border-b border-stone-200/50">
        <div className="max-w-lg mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-stone-100 text-stone-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-stone-900">Leaderboard</span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Podium */}
        {data.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-12 pt-4">
            {[1, 0, 2].map((rank) => {
              const user = data[rank];
              if (!user) return null;
              const heights: Record<number, string> = { 0: "h-28", 1: "h-20", 2: "h-16" };
              const medals: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };
              return (
                <motion.div
                  key={rank}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: rank * 0.15, type: "spring" }}
                  className="flex flex-col items-center"
                >
                  <span className="text-2xl mb-2">{medals[rank]}</span>
                  <div className="w-11 h-11 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm mb-1">
                    {user.name?.[0] || "?"}
                  </div>
                  <p className="text-xs font-bold text-stone-900 mb-0.5">{user.name}</p>
                  <p className="text-[10px] text-orange-500 font-bold mb-2">{user.best_streak}d streak</p>
                  <div className={`w-20 ${heights[rank]} bg-gradient-to-t from-stone-200 to-stone-100 rounded-t-xl`} />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {data.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-200"
            >
              <span className="text-sm font-black text-stone-300 w-6 text-center">
                {i + 1}
              </span>
              <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm">
                {user.name?.[0] || "?"}
              </div>
              <div className="flex-1">
                <p className="font-bold text-stone-900 text-sm">{user.name}</p>
                <p className="text-xs text-stone-400">{user.total_stakes} stakes</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-stone-900 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {user.best_streak}
                </p>
                <p className="text-[10px] text-stone-400 font-medium">day streak</p>
              </div>
            </motion.div>
          ))}
          {data.length === 0 && !loading && (
            <div className="text-center py-20">
              <span className="text-5xl mb-4 block">🏆</span>
              <p className="font-bold text-stone-900 text-lg">No one yet</p>
              <p className="text-stone-400 text-sm mt-1">Be the first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
