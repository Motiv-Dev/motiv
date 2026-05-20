"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Users, Trophy, ThumbsUp, ThumbsDown, Crown, Flame, Copy, Check, Image } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface GroupData {
  group: any;
  members: any[];
  leaderboard: any[];
  stats: { total_forfeited: number; platform_cut: number; prize_pool: number; member_count: number };
}

interface Proof {
  id: number;
  user_id: number;
  user_name: string;
  day_number: number;
  photo_url: string;
  status: string;
  approve_count: number;
  reject_count: number;
  my_vote: string | null;
  submitted_at: string;
}

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const { isLoaded, isSignedIn } = useAuth();

  const [data, setData] = useState<GroupData | null>(null);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [dayNumber, setDayNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<number | null>(null);
  const [tab, setTab] = useState<"leaderboard" | "proofs">("leaderboard");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) { router.push("/sign-in"); return; }
    if (isLoaded && isSignedIn) {
      fetchData();
      fetchProofs();
    }
  }, [isLoaded, isSignedIn]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      if (!res.ok) throw new Error();
      const d: any = await res.json();
      setData(d);
    } catch { } finally { setLoading(false); }
  }

  async function fetchProofs() {
    try {
      const res = await fetch(`/api/groups/${groupId}/proofs`);
      if (!res.ok) return;
      const d: any = await res.json();
      setProofs(d.proofs || []);
      setDayNumber(d.day_number || 0);
    } catch { }
  }

  async function handleVote(proofId: number, vote: "approve" | "reject") {
    setVoting(proofId);
    try {
      const res = await fetch(`/api/groups/${groupId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof_id: proofId, vote }),
      });
      if (res.ok) { fetchProofs(); fetchData(); }
    } catch { } finally { setVoting(null); }
  }

  function copyCode() {
    if (data?.group.invite_code) {
      navigator.clipboard.writeText(data.group.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl font-script text-orange-500 animate-pulse transform -rotate-2">Motiv</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <p className="text-stone-400">Group not found</p>
      </div>
    );
  }

  const { group, leaderboard, stats } = data;

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <nav className="sticky top-0 z-50 bg-[#faf9f7]/80 backdrop-blur-xl border-b border-stone-200/50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/groups" className="p-2 rounded-xl hover:bg-stone-100 text-stone-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <span className="font-bold text-stone-900 text-sm">{group.name}</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
              group.status === "open" ? "bg-emerald-100 text-emerald-700" :
              group.status === "active" ? "bg-orange-100 text-orange-700" :
              "bg-stone-100 text-stone-500"
            }`}>{group.status}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Stats Banner */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-[#1c1917] rounded-3xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-stone-500" />
                <span className="text-stone-400 text-sm font-semibold">{stats.member_count} members</span>
              </div>
              <button onClick={copyCode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800 text-stone-400 text-xs font-mono font-bold hover:bg-stone-700 transition-colors">
                {group.invite_code}
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-black text-red-500">{formatCurrency(stats.total_forfeited)}</p>
                <p className="text-[9px] text-stone-500 font-semibold uppercase tracking-wider">Forfeited</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-500">{formatCurrency(stats.prize_pool)}</p>
                <p className="text-[9px] text-stone-500 font-semibold uppercase tracking-wider">Prize Pool</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-orange-500">{formatCurrency(group.stake_amount)}</p>
                <p className="text-[9px] text-stone-500 font-semibold uppercase tracking-wider">Per Person</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("leaderboard")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              tab === "leaderboard" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}>
            <Trophy className="w-4 h-4 inline mr-2" />Leaderboard
          </button>
          <button onClick={() => setTab("proofs")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              tab === "proofs" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}>
            <Image className="w-4 h-4 inline mr-2" />Today&apos;s Proofs
          </button>
        </div>

        {/* Leaderboard */}
        {tab === "leaderboard" && (
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <motion.div key={entry.user_id}
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.06 }}
                className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${
                  entry.is_me ? "border-orange-300 bg-orange-50/30" : "border-stone-200"
                }`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${
                  idx === 0 ? "bg-amber-100 text-amber-700" :
                  idx === 1 ? "bg-stone-200 text-stone-600" :
                  idx === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-stone-100 text-stone-400"
                }`}>
                  {idx === 0 ? <Crown className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-900 text-sm truncate">
                    {entry.name}{entry.is_me ? " (You)" : ""}
                  </p>
                  <p className="text-xs text-stone-400">
                    {entry.completed_days} days done · {entry.streak} streak
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {entry.potential_payout > 0 ? (
                    <>
                      <p className="text-sm font-black text-emerald-600">+{formatCurrency(entry.potential_payout)}</p>
                      <p className="text-[9px] text-stone-400 font-semibold">{entry.share}% share</p>
                    </>
                  ) : (
                    <p className="text-xs text-stone-400 font-semibold">--</p>
                  )}
                </div>
              </motion.div>
            ))}

            {leaderboard.length === 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
                <p className="text-stone-400 text-sm">No activity yet. Start submitting proofs!</p>
              </div>
            )}
          </div>
        )}

        {/* Today's Proofs */}
        {tab === "proofs" && (
          <div className="space-y-4">
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Day {dayNumber}</p>

            {proofs.length > 0 ? proofs.map((proof, idx) => (
              <motion.div key={proof.id}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{proof.user_name}</p>
                    <p className="text-xs text-stone-400">
                      {proof.submitted_at ? new Date(proof.submitted_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    proof.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                    proof.status === "rejected" ? "bg-red-50 text-red-600" :
                    "bg-amber-50 text-amber-600"
                  }`}>{proof.status}</span>
                </div>

                {proof.photo_url && (
                  <div className="rounded-xl overflow-hidden mb-4 bg-stone-100">
                    <img src={proof.photo_url} alt="Proof" className="w-full h-48 object-cover" />
                  </div>
                )}

                {/* Voting */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-stone-400 font-semibold">
                    <span className="text-emerald-600">{proof.approve_count} approves</span>
                    <span className="text-red-500">{proof.reject_count} rejects</span>
                  </div>

                  {proof.my_vote ? (
                    <span className={`text-xs font-bold ${proof.my_vote === "approve" ? "text-emerald-500" : "text-red-500"}`}>
                      You voted {proof.my_vote}
                    </span>
                  ) : proof.status === "submitted" ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleVote(proof.id, "approve")} disabled={voting === proof.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50">
                        <ThumbsUp className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => handleVote(proof.id, "reject")} disabled={voting === proof.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50">
                        <ThumbsDown className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
                <p className="text-stone-400 text-sm">No proofs submitted today yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
