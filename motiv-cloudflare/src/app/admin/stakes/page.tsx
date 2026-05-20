"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Play, X, CheckCircle, Ban, RotateCcw } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type StakeStatus = "all" | "active" | "completed" | "failed" | "pending_payment" | "cancelled";

export default function AdminStakes() {
  const [stakes, setStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StakeStatus>("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => { fetchStakes(); }, [filter]);

  async function fetchStakes() {
    setLoading(true);
    const res = await fetch(`/api/admin/stakes?status=${filter}`);
    const data: any = await res.json();
    setStakes(data.stakes || []);
    setLoading(false);
  }

  async function handleAction(stakeId: number, action: string) {
    if (!confirm(`Are you sure you want to ${action.replace("_", " ")} this stake?`)) return;
    setActionLoading(stakeId);
    try {
      const res = await fetch("/api/admin/stakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stake_id: stakeId, action }),
      });
      if (res.ok) fetchStakes();
    } finally {
      setActionLoading(null);
    }
  }

  const filters: { value: StakeStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "pending_payment", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400",
    completed: "bg-blue-500/20 text-blue-400",
    failed: "bg-red-500/20 text-red-400",
    pending_payment: "bg-amber-500/20 text-amber-400",
    cancelled: "bg-stone-500/20 text-stone-400",
  };

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <nav className="border-b border-stone-800">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/admin" className="p-2 rounded-xl hover:bg-stone-800 text-stone-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold">Stakes Management</span>
          <span className="ml-auto text-sm text-stone-500">{stakes.length} stakes</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f.value ? "bg-orange-500 text-white" : "bg-stone-900 text-stone-400 border border-stone-800 hover:border-stone-700"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-500">Loading...</div>
        ) : (
          <div className="space-y-3">
            {stakes.map((stake: any) => (
              <div key={stake.id} className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold capitalize">{stake.habit_type?.replace("_", " ")}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[stake.status] || statusColors.cancelled}`}>
                        {stake.status?.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      {stake.user_name} · {stake.user_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-orange-400">{formatCurrency(stake.total_amount)}</p>
                    <p className="text-xs text-stone-500">{formatCurrency(stake.daily_amount)}/day · {stake.duration_days}d</p>
                  </div>
                </div>

                <div className="flex gap-6 mb-4">
                  <div>
                    <p className="text-[10px] text-stone-600 uppercase font-bold">Streak</p>
                    <p className="text-sm font-bold">{stake.current_streak || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-600 uppercase font-bold">Done</p>
                    <p className="text-sm font-bold text-emerald-400">{stake.completed_days || 0}/{stake.duration_days}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-600 uppercase font-bold">Missed</p>
                    <p className="text-sm font-bold text-red-400">{stake.missed_days || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-600 uppercase font-bold">Burned</p>
                    <p className="text-sm font-bold text-red-400">{formatCurrency(stake.total_burned || 0)}</p>
                  </div>
                  {stake.start_date && (
                    <div>
                      <p className="text-[10px] text-stone-600 uppercase font-bold">Period</p>
                      <p className="text-sm font-medium text-stone-400">{formatDate(stake.start_date)} → {formatDate(stake.end_date)}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {stake.status === "pending_payment" && (
                    <button onClick={() => handleAction(stake.id, "activate")} disabled={actionLoading === stake.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-all disabled:opacity-50">
                      <Play className="w-3 h-3" /> Activate
                    </button>
                  )}
                  {stake.status === "active" && (
                    <>
                      <button onClick={() => handleAction(stake.id, "force_complete")} disabled={actionLoading === stake.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-all disabled:opacity-50">
                        <CheckCircle className="w-3 h-3" /> Force Complete
                      </button>
                      <button onClick={() => handleAction(stake.id, "force_fail")} disabled={actionLoading === stake.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-all disabled:opacity-50">
                        <Ban className="w-3 h-3" /> Force Fail
                      </button>
                    </>
                  )}
                  {(stake.status === "active" || stake.status === "pending_payment") && (
                    <button onClick={() => handleAction(stake.id, "cancel_refund")} disabled={actionLoading === stake.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-700/50 text-stone-400 rounded-lg text-xs font-bold hover:bg-stone-700 transition-all disabled:opacity-50">
                      <RotateCcw className="w-3 h-3" /> Cancel & Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
            {stakes.length === 0 && (
              <div className="text-center py-20 text-stone-500">No stakes found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
