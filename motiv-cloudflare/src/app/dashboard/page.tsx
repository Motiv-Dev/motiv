"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Flame, Trophy, MapPin, Camera, Monitor,
  Upload, ArrowRight, Clock, Share2, Wallet, X, Users,
  CheckCircle2, AlertTriangle, Loader2
} from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { formatCurrency } from "@/lib/utils";
import StreakRing from "@/components/ui/FlowerScene";
import DayHeatmap from "@/components/ui/DayHeatmap";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { useConfetti } from "@/components/ui/Confetti";
import { sounds } from "@/lib/sounds";
import { useAppStore } from "@/lib/store";
import { BadgeCollection } from "@/components/ui/StreakBadge";
import dynamic from "next/dynamic";

const WallOfShame = dynamic(() => import("@/components/ui/WallOfShame"), { ssr: false });

interface DayStatus {
  day: number;
  status: string;
}

interface Stake {
  id: number;
  habit_type: string;
  habit_description: string;
  total_amount: number;
  daily_amount: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: string;
  current_streak: number;
  total_completed: number;
  total_burned: number;
  completed_days: number;
  missed_days: number;
  gym_name: string;
  daily_statuses: DayStatus[];
  today_proof: { status: string; admin_notes: string | null; submitted_at: string; day_number: number } | null;
}

interface User {
  id: number;
  email: string;
  name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProof, setActiveProof] = useState<number | null>(null);
  const [keyword, setKeyword] = useState<{ code: string; expires: string; stakeId: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [proofMsg, setProofMsg] = useState("");
  const [walletOpen, setWalletOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [leewayStake, setLeewayStake] = useState<number | null>(null);
  const [leewayReason, setLeewayReason] = useState("");
  const videoRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const screentimeRef = useRef<HTMLInputElement>(null);
  const fireConfetti = useConfetti();
  const { soundEnabled } = useAppStore();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (isLoaded && isSignedIn) {
      fetchData();
    }
  }, [isLoaded, isSignedIn]);

  // Auto-dismiss proof toast after 5 seconds
  useEffect(() => {
    if (proofMsg) {
      const timer = setTimeout(() => setProofMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [proofMsg]);

  async function fetchData() {
    try {
      const [userRes, stakesRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/stakes"),
      ]);
      if (!userRes.ok) { router.push("/sign-in"); return; }
      const userData: any = await userRes.json();
      const stakesData: any = await stakesRes.json();
      setUser(userData.user);
      setStakes(stakesData.stakes || []);
    } catch {
      router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  }

  async function generateKeyword(stakeId: number) {
    if (soundEnabled) sounds.click();
    const res = await fetch("/api/proofs/keyword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stake_id: stakeId }),
    });
    const data: any = await res.json();
    if (res.ok) {
      setKeyword({ code: data.keyword, expires: data.expires_at, stakeId });
      setActiveProof(stakeId);
      if (soundEnabled) sounds.whoosh();
    }
  }

  async function submitProof(stakeId: number) {
    if (!keyword) return;
    setSubmitting(true);
    setProofMsg("");

    const formData = new FormData();
    formData.append("stake_id", stakeId.toString());
    formData.append("keyword", keyword.code);

    const video = videoRef.current?.files?.[0];
    if (video) formData.append("photo", video);
    const photo = photoRef.current?.files?.[0];
    if (photo) formData.append("photo", photo);

    const screentime = screentimeRef.current?.files?.[0];
    if (screentime) formData.append("screentime", screentime);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      );
      formData.append("gps_lat", pos.coords.latitude.toString());
      formData.append("gps_lng", pos.coords.longitude.toString());
    } catch {}

    try {
      const res = await fetch("/api/proofs", { method: "POST", body: formData });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (soundEnabled) sounds.whoosh();
      setProofMsg(data.auto_verified ? "Auto-verified! Proof approved." : "Proof submitted! Pending review.");
      setActiveProof(null);
      setKeyword(null);
      const stake = stakes.find((s) => s.id === stakeId);
      if (stake) fireConfetti(stake.current_streak + 1);
      fetchData();
    } catch (err: any) {
      setProofMsg(err.message);
      if (soundEnabled) sounds.burn();
    } finally {
      setSubmitting(false);
    }
  }

  const activeStakes = stakes.filter((s) => s.status === "active");
  const pastStakes = stakes.filter((s) => s.status !== "active" && s.status !== "pending_payment");
  const pendingStakes = stakes.filter((s) => s.status === "pending_payment");
  const bestStreak = Math.max(0, ...stakes.map((s) => s.current_streak));

  function getCurrentDay(stake: Stake): number {
    const start = new Date(stake.start_date);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(diffDays, 1), stake.duration_days);
  }

  function getHabitEmoji(type: string) {
    switch (type) {
      case "gym": return "🏋️";
      case "fitness": return "💪";
      case "running": return "🏃";
      case "study": return "📚";
      case "wake_up": return "⏰";
      case "coding": return "💻";
      case "screentime": return "📱";
      case "no_porn": return "🛡️";
      case "no_doomscroll": return "📵";
      default: return "🔥";
    }
  }

  // Wallet calculations
  const completedStakes = stakes.filter((s) => s.status === "completed");
  const totalRefundable = completedStakes.reduce((sum, s) => sum + Math.max(0, s.total_amount - s.total_burned), 0);
  const totalStaked = stakes.filter((s) => s.status === "active").reduce((sum, s) => sum + s.total_amount, 0);
  const totalBurned = stakes.reduce((sum, s) => sum + s.total_burned, 0);
  const totalSaved = stakes.reduce((sum, s) => sum + s.total_completed * s.daily_amount, 0);

  async function handleWithdraw(stakeId: number) {
    if (!upiId) { setProofMsg("Enter your UPI ID first"); return; }
    setWithdrawing(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stake_id: stakeId, upi_id: upiId }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProofMsg("Withdrawal requested! You'll receive funds within 24-48 hours.");
      fetchData();
    } catch (err: any) {
      setProofMsg(err.message);
    } finally {
      setWithdrawing(false);
    }
  }

  async function requestLeeway(stakeId: number) {
    if (!leewayReason.trim()) { setProofMsg("Please provide a reason"); return; }
    try {
      const res = await fetch("/api/leeway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stake_id: stakeId, reason: leewayReason }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProofMsg("Skip day requested! Admin will review.");
      setLeewayStake(null);
      setLeewayReason("");
    } catch (err: any) {
      setProofMsg(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl font-script text-orange-500 animate-pulse-soft transform -rotate-2">Motiv</div>
        <p className="text-sm text-stone-400 animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#faf9f7]/80 backdrop-blur-xl border-b border-stone-200/50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-script text-orange-500 transform -rotate-2">Motiv</Link>
          <div className="flex items-center gap-4">
            <button onClick={() => setWalletOpen(!walletOpen)} className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-orange-500 transition-colors relative">
              <Wallet className="w-5 h-5" />
              {totalRefundable > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>
            <Link href="/groups" className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-orange-500 transition-colors">
              <Users className="w-5 h-5" />
            </Link>
            <Link href="/leaderboard" className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-orange-500 transition-colors">
              <Trophy className="w-5 h-5" />
            </Link>
            <div className="p-1">
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Wallet Panel */}
      <AnimatePresence>
        {walletOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-stone-200 overflow-hidden bg-white"
          >
            <div className="max-w-2xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-stone-900">Wallet</h3>
                <button onClick={() => setWalletOpen(false)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-stone-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-stone-900">{formatCurrency(totalStaked)}</p>
                  <p className="text-[10px] text-stone-400 font-semibold uppercase">Active</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-emerald-600">{formatCurrency(totalSaved)}</p>
                  <p className="text-[10px] text-stone-400 font-semibold uppercase">Saved</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-red-500">{formatCurrency(totalBurned)}</p>
                  <p className="text-[10px] text-stone-400 font-semibold uppercase">Burned</p>
                </div>
              </div>

              {totalRefundable > 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                  <p className="text-sm font-bold text-emerald-800 mb-1">Available to withdraw</p>
                  <p className="text-3xl font-black text-emerald-600 mb-4">{formatCurrency(totalRefundable)}</p>
                  <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Your UPI ID (e.g. name@upi)"
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-white text-stone-900 font-medium focus:border-emerald-400 outline-none transition-colors mb-3 text-sm" />
                  <div className="space-y-2">
                    {completedStakes.filter(s => s.total_amount - s.total_burned > 0).map((s) => (
                      <button key={s.id} onClick={() => handleWithdraw(s.id)} disabled={withdrawing || !upiId}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {withdrawing ? "Processing..." : `Withdraw ${formatCurrency(s.total_amount - s.total_burned)} (${s.habit_type})`}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-stone-50 rounded-2xl p-5 text-center">
                  <p className="text-sm text-stone-400 font-medium">Complete a stake to unlock withdrawals</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Greeting */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-10"
        >
          <p className="text-stone-400 text-sm font-medium mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold text-stone-900">{user?.name}</h1>
        </motion.div>

        {/* Badges */}
        {bestStreak >= 3 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mb-8 bg-white rounded-2xl border border-stone-200 p-5"
          >
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Achievements</p>
            <BadgeCollection streak={bestStreak} />
          </motion.div>
        )}

        {/* Contextual tips */}
        {activeStakes.length > 0 && activeStakes.some(s => (s.completed_days || 0) === 0) && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mb-6 bg-orange-50 border border-orange-100 rounded-2xl p-4"
          >
            <p className="text-sm font-bold text-orange-700 mb-1">Pro tip</p>
            <p className="text-xs text-stone-500">Submit your first proof ASAP! The longer you wait, the more likely you&apos;ll miss it. Build momentum from day 1.</p>
          </motion.div>
        )}

        {activeStakes.length > 0 && activeStakes.some(s => s.current_streak >= 5 && s.current_streak < 7) && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mb-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-4"
          >
            <p className="text-sm font-bold text-emerald-700 mb-1">You&apos;re on fire!</p>
            <p className="text-xs text-stone-500">5+ day streak! Keep going — research shows 7 consecutive days creates lasting habit change. You&apos;re almost there.</p>
          </motion.div>
        )}

        {activeStakes.length === 0 && pastStakes.length > 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-4"
          >
            <p className="text-sm font-bold text-blue-700 mb-1">Ready for round 2?</p>
            <p className="text-xs text-stone-500">You&apos;ve completed stakes before. Stack your habits — try a new challenge while the discipline is fresh.</p>
          </motion.div>
        )}

        {/* ALL active stakes */}
        {activeStakes.length > 0 ? (
          <div className="space-y-6">
            {activeStakes.map((stake, idx) => (
              <motion.div
                key={stake.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{getHabitEmoji(stake.habit_type)}</span>
                      <h2 className="text-xl font-bold text-stone-900 capitalize">
                        {stake.habit_type.replace("_", " ")}
                      </h2>
                    </div>
                    <p className="text-stone-400 text-sm font-medium">
                      {stake.completed_days || 0} of {stake.duration_days} days
                    </p>
                  </div>
                  <StreakRing
                    streak={stake.current_streak}
                    totalDays={stake.duration_days}
                    failed={stake.status === "failed"}
                    size={120}
                    dailyStatuses={stake.daily_statuses || []}
                    currentDay={getCurrentDay(stake)}
                  />
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((stake.completed_days || 0) / stake.duration_days) * 100}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-black text-stone-900">{formatCurrency(stake.daily_amount)}</p>
                    <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide mt-1">Daily Risk</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-emerald-500">{formatCurrency(stake.total_completed * stake.daily_amount)}</p>
                    <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide mt-1">Saved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-red-500">{formatCurrency(stake.total_burned)}</p>
                    <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide mt-1">Burned</p>
                  </div>
                </div>

                {/* Day Heatmap */}
                <div className="mb-6 bg-stone-50 rounded-2xl p-4">
                  <DayHeatmap
                    totalDays={stake.duration_days}
                    currentDay={getCurrentDay(stake)}
                    dailyStatuses={stake.daily_statuses || []}
                  />
                </div>

                {/* Countdown */}
                {stake.end_date && (
                  <div className="mb-6">
                    <CountdownTimer deadline={new Date().toISOString()} dailyAmount={stake.daily_amount} />
                  </div>
                )}

                {/* Today's proof status feedback */}
                {stake.today_proof && (
                  <div className={`mb-6 rounded-2xl p-4 flex items-start gap-3 ${
                    stake.today_proof.status === "approved"
                      ? "bg-emerald-50 border border-emerald-200"
                      : stake.today_proof.status === "rejected"
                      ? "bg-red-50 border border-red-200"
                      : "bg-amber-50 border border-amber-200"
                  }`}>
                    {stake.today_proof.status === "approved" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : stake.today_proof.status === "rejected" ? (
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0 animate-spin" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${
                        stake.today_proof.status === "approved" ? "text-emerald-700"
                        : stake.today_proof.status === "rejected" ? "text-red-700"
                        : "text-amber-700"
                      }`}>
                        {stake.today_proof.status === "approved" ? "Today's proof verified"
                         : stake.today_proof.status === "rejected" ? "Proof rejected — re-upload before midnight"
                         : "Proof pending review"}
                      </p>
                      {stake.today_proof.admin_notes && (
                        <p className="text-xs text-stone-500 mt-1">
                          Admin: {stake.today_proof.admin_notes}
                        </p>
                      )}
                      {stake.today_proof.status === "approved" && (
                        <p className="text-xs text-emerald-500 mt-1 font-medium">
                          Day {stake.today_proof.day_number} complete — {formatCurrency(stake.daily_amount)} saved
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Proof submission */}
                {activeProof === stake.id && keyword ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="space-y-4 pt-4 border-t border-stone-100"
                  >
                    <div className="text-center py-4">
                      <p className="text-sm text-stone-500 mb-3">Record a short video saying this keyword out loud</p>
                      <div className="inline-block px-8 py-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
                        <span className="text-4xl font-mono font-black text-orange-500 tracking-[0.3em]">{keyword.code}</span>
                      </div>
                      <p className="text-xs text-stone-400 mt-3">Say the keyword clearly in your video — expires in 5 minutes</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                          <Camera className="w-4 h-4" /> Video proof <span className="text-orange-500 text-xs font-bold">(recommended)</span>
                        </label>
                        <input ref={videoRef} type="file" accept="video/*" capture="environment"
                          className="w-full text-sm text-stone-500 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:bg-stone-900 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-stone-800" />
                        <p className="text-xs text-stone-400 mt-1.5">Record yourself doing the activity while saying the keyword</p>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-x-0 top-1/2 h-px bg-stone-200" />
                        <p className="relative text-center"><span className="bg-white px-3 text-xs text-stone-400 font-semibold">OR</span></p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                          <Upload className="w-4 h-4" /> Photo proof
                        </label>
                        <input ref={photoRef} type="file" accept="image/*" capture="environment"
                          className="w-full text-sm text-stone-500 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:bg-stone-100 file:text-stone-700 file:font-semibold file:cursor-pointer hover:file:bg-stone-100" />
                        <p className="text-xs text-stone-400 mt-1.5">Photo with keyword written on paper + screen time screenshot</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                          <Monitor className="w-4 h-4" /> Screen Time <span className="text-stone-400 font-normal">(for doom scrolling stakes)</span>
                        </label>
                        <input ref={screentimeRef} type="file" accept="image/*"
                          className="w-full text-sm text-stone-500 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:bg-stone-100 file:text-stone-700 file:font-semibold file:cursor-pointer" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-400">
                        <MapPin className="w-4 h-4 text-orange-500" /> GPS captured automatically
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button onClick={() => submitProof(stake.id)} disabled={submitting}
                        className="flex-1 py-4 bg-stone-900 text-white rounded-2xl font-bold transition-all disabled:opacity-50 hover:bg-stone-800">
                        {submitting ? "Submitting..." : "Submit Video Proof"}
                      </button>
                      <button onClick={() => { setActiveProof(null); setKeyword(null); }}
                        className="px-6 py-4 border-2 border-stone-200 rounded-2xl text-stone-500 font-semibold hover:bg-stone-50 transition-all">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                  <div className="flex gap-3">
                    {stake.today_proof?.status === "approved" ? (
                      <div className="flex-1 py-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl font-bold text-base flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Done for today
                      </div>
                    ) : (
                    <button
                      onClick={() => generateKeyword(stake.id)}
                      className={`flex-1 py-4 rounded-2xl font-bold text-base transition-all hover:shadow-lg flex items-center justify-center gap-2 ${
                        stake.today_proof?.status === "rejected"
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : stake.today_proof?.status === "pending"
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "bg-stone-900 text-white hover:bg-stone-800"
                      }`}
                    >
                      <Upload className="w-5 h-5" />
                      {stake.today_proof?.status === "rejected" ? "Re-upload Proof"
                       : stake.today_proof?.status === "pending" ? "Update Proof"
                       : "Submit Proof"}
                    </button>
                    )}
                    <button
                      onClick={() => {
                        const text = `I staked ${formatCurrency(stake.total_amount)} on ${stake.habit_type.replace("_", " ")}. Day ${stake.completed_days || 0}/${stake.duration_days}. Miss a day = lose ${formatCurrency(stake.daily_amount)}. motiv.app`;
                        if (navigator.share) {
                          navigator.share({ text });
                        } else {
                          navigator.clipboard.writeText(text);
                          setProofMsg("Copied to clipboard!");
                        }
                      }}
                      className="px-4 py-4 border-2 border-stone-200 rounded-2xl text-stone-400 hover:text-orange-500 hover:border-orange-200 transition-all"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Skip day request */}
                  {!stake.today_proof && (
                    <div className="mt-3">
                      {leewayStake === stake.id ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                          <p className="text-sm font-bold text-amber-700">Request a skip day</p>
                          <p className="text-xs text-stone-500">If you genuinely can&apos;t complete today (traveling, sick, etc.), request a leeway. Admin will review.</p>
                          <input
                            type="text" value={leewayReason} onChange={e => setLeewayReason(e.target.value)}
                            placeholder="Why do you need a skip? (e.g. traveling, sick)"
                            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-stone-900 text-sm font-medium focus:border-amber-400 outline-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => requestLeeway(stake.id)}
                              className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all">
                              Submit Request
                            </button>
                            <button onClick={() => { setLeewayStake(null); setLeewayReason(""); }}
                              className="px-4 py-2.5 border border-stone-200 rounded-xl text-stone-500 text-sm font-semibold hover:bg-stone-50">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setLeewayStake(stake.id)}
                          className="text-xs text-stone-400 hover:text-amber-600 font-medium transition-colors">
                          Can&apos;t do it today? Request a skip day
                        </button>
                      )}
                    </div>
                  )}
                </>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-stone-200 p-12 text-center mb-6"
          >
            <span className="text-5xl mb-4 block">🔥</span>
            <h2 className="text-2xl font-bold text-stone-900 mb-3">No active stakes</h2>
            <p className="text-stone-400 mb-8 max-w-xs mx-auto">
              Put your money where your mouth is. Create your first stake.
            </p>
            <Link href="/stake/new" className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all hover:shadow-lg">
              <Plus className="w-5 h-5" /> Create Stake
            </Link>
          </motion.div>
        )}

        {/* Toast notification — fixed at top */}
        <AnimatePresence>
          {proofMsg && (
            <motion.div
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl text-sm font-bold shadow-xl ${
                proofMsg.includes("verified") || proofMsg.includes("submitted") || proofMsg.includes("Copied") || proofMsg.includes("Withdrawal")
                  ? "bg-emerald-500 text-white shadow-emerald-200"
                  : proofMsg.includes("Pending") || proofMsg.includes("review")
                  ? "bg-amber-500 text-white shadow-amber-200"
                  : "bg-red-500 text-white shadow-red-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <span>{proofMsg.includes("verified") || proofMsg.includes("submitted") ? "🎉" : proofMsg.includes("Pending") || proofMsg.includes("review") ? "⏳" : "⚠️"}</span>
                <span>{proofMsg}</span>
                <button onClick={() => setProofMsg("")} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">&times;</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending payment stakes */}
        {pendingStakes.map((stake) => (
          <motion.div
            key={stake.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-amber-50 rounded-2xl border border-amber-200 p-6 mb-4 mt-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-stone-900 capitalize">{stake.habit_type.replace("_", " ")}</p>
                <p className="text-sm text-amber-600 font-medium">Payment pending</p>
              </div>
              <Link href={`/stake/new?pay=${stake.id}&amount=${stake.total_amount}`}
                className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all flex items-center gap-1">
                Pay {formatCurrency(stake.total_amount)} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}

        {/* Past stakes */}
        {pastStakes.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h3 className="text-lg font-bold text-stone-900 mb-4">Past Stakes</h3>
            <div className="space-y-3">
              {pastStakes.map((stake) => (
                <div key={stake.id} className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getHabitEmoji(stake.habit_type)}</span>
                    <div>
                      <p className="font-bold text-stone-900 capitalize text-sm">{stake.habit_type.replace("_", " ")}</p>
                      <p className="text-xs text-stone-400">{stake.completed_days}/{stake.duration_days} days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                      stake.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                      stake.status === "failed" ? "bg-red-50 text-red-600" :
                      "bg-amber-50 text-amber-600"
                    }`}>
                      {stake.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* New stake CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Link href="/stake/new"
            className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 font-semibold hover:border-stone-300 hover:text-stone-500 transition-all">
            <Plus className="w-5 h-5" /> New Stake
          </Link>
        </motion.div>

        {/* Wall of Shame */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-8"
        >
          <WallOfShame />
        </motion.div>
      </div>
    </div>
  );
}
