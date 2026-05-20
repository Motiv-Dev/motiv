"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Plus, Users, Trophy, Copy, Check, X, Flame, Code2, Dumbbell, Smartphone, ShieldOff, Clock, BookOpen, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface Group {
  id: number;
  name: string;
  invite_code: string;
  habit_type: string;
  duration_days: number;
  stake_amount: number;
  max_members: number;
  member_count: number;
  status: string;
  creator_name: string;
  start_date: string;
  my_stake_id: number | null;
}

const habitMeta: Record<string, { emoji: string; label: string }> = {
  fitness: { emoji: "💪", label: "Fitness" },
  coding: { emoji: "💻", label: "Coding" },
  screentime: { emoji: "📱", label: "Screen Time" },
  no_porn: { emoji: "🛡️", label: "No Adult Content" },
  wake_up: { emoji: "⏰", label: "Wake Up" },
  study: { emoji: "📚", label: "Study" },
  gym: { emoji: "🏋️", label: "Gym" },
  custom: { emoji: "🎯", label: "Custom" },
};

const habitOptions = [
  { id: "fitness", label: "Fitness", Icon: Dumbbell },
  { id: "coding", label: "Coding", Icon: Code2 },
  { id: "screentime", label: "Screen Time", Icon: Smartphone },
  { id: "no_porn", label: "No Adult Content", Icon: ShieldOff },
  { id: "wake_up", label: "Wake Up", Icon: Clock },
  { id: "study", label: "Study", Icon: BookOpen },
  { id: "custom", label: "Custom", Icon: Target },
];

export default function GroupsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    habit_type: "fitness",
    duration_days: 21,
    stake_amount: 1000,
    max_members: 10,
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) { router.push("/sign-in"); return; }
    if (isLoaded && isSignedIn) fetchGroups();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(""); setSuccess(""); }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  async function fetchGroups() {
    try {
      const res = await fetch("/api/groups");
      if (!res.ok) throw new Error("Failed to load groups");
      const data: any = await res.json();
      setGroups(data.groups || []);
    } catch { } finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!createForm.name.trim()) { setError("Group name is required"); return; }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Group created! Share the invite code with friends.");
      setShowCreate(false);
      setCreateForm({ name: "", habit_type: "fitness", duration_days: 21, stake_amount: 1000, max_members: 10 });
      fetchGroups();
    } catch (err: any) {
      setError(err.message);
    } finally { setCreating(false); }
  }

  async function handleJoin() {
    if (!joinCode.trim()) { setError("Enter an invite code"); return; }
    setJoining(true);
    setError("");
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: joinCode }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Joined group!");
      setJoinCode("");
      fetchGroups();
    } catch (err: any) {
      setError(err.message);
    } finally { setJoining(false); }
  }

  function copyCode(code: string, id: number) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl font-script text-orange-500 animate-pulse transform -rotate-2">Motiv</div>
        <p className="text-sm text-stone-400 animate-pulse">Loading groups...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#faf9f7]/80 backdrop-blur-xl border-b border-stone-200/50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-xl hover:bg-stone-100 text-stone-400">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-bold text-stone-900">Groups</span>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors">
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>
      </nav>

      {/* Toast */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl text-sm font-bold shadow-xl ${
              error ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
            }`}>
            {error || success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Join Group */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="mb-8 bg-white rounded-2xl border border-stone-200 p-5">
          <p className="text-sm font-bold text-stone-900 mb-3">Join a group challenge</p>
          <div className="flex gap-3">
            <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code"
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-mono font-bold text-center tracking-widest uppercase focus:border-orange-400 outline-none transition-colors" />
            <button onClick={handleJoin} disabled={joining}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
              {joining ? "..." : "Join"}
            </button>
          </div>
        </motion.div>

        {/* Groups List */}
        {groups.length > 0 ? (
          <div className="space-y-4">
            {groups.map((group, idx) => {
              const meta = habitMeta[group.habit_type] || habitMeta.custom;
              return (
                <motion.div key={group.id}
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.08 }}>
                  <Link href={`/groups/${group.id}`}
                    className="block bg-white rounded-2xl border border-stone-200 p-6 hover:border-stone-300 hover:shadow-sm transition-all group/card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-lg">
                          {meta.emoji}
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900 group-hover/card:text-orange-600 transition-colors">{group.name}</h3>
                          <p className="text-xs text-stone-400 font-medium">by {group.creator_name}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        group.status === "open" ? "bg-emerald-50 text-emerald-600" :
                        group.status === "active" ? "bg-orange-50 text-orange-600" :
                        "bg-stone-100 text-stone-500"
                      }`}>
                        {group.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-stone-50 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-black text-stone-900">{formatCurrency(group.stake_amount)}</p>
                        <p className="text-[9px] text-stone-400 font-semibold uppercase">Per Person</p>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-black text-stone-900">{group.duration_days}d</p>
                        <p className="text-[9px] text-stone-400 font-semibold uppercase">Duration</p>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-black text-stone-900 flex items-center justify-center gap-1">
                          <Users className="w-3.5 h-3.5 text-stone-400" /> {group.member_count}/{group.max_members}
                        </p>
                        <p className="text-[9px] text-stone-400 font-semibold uppercase">Members</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-stone-400 font-semibold uppercase">Invite</span>
                        <span className="font-mono text-xs font-bold text-orange-500 tracking-wider">{group.invite_code}</span>
                      </div>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyCode(group.invite_code, group.id); }}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
                        {copiedId === group.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-stone-300" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">No groups yet</h3>
            <p className="text-stone-400 text-sm mb-6 max-w-xs mx-auto">
              Create a group challenge or join one with an invite code. Compete with friends — quitters fund the winners.
            </p>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all">
              <Plus className="w-5 h-5" /> Create Group
            </button>
          </motion.div>
        )}
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowCreate(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white rounded-t-3xl border-b border-stone-100 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900">Create Group Challenge</h3>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Group Name</label>
                  <input type="text" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Sigma Grind Squad"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 font-medium focus:border-orange-400 outline-none transition-colors" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Habit Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {habitOptions.map(h => (
                      <button key={h.id} onClick={() => setCreateForm(f => ({ ...f, habit_type: h.id }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          createForm.habit_type === h.id ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-300"
                        }`}>
                        <h.Icon className={`w-4 h-4 mx-auto mb-1 ${createForm.habit_type === h.id ? "text-orange-500" : "text-stone-400"}`} />
                        <p className="text-[11px] font-bold text-stone-700">{h.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Stake / Person</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">₹</span>
                      <input type="number" min={500} max={5000} step={100} value={createForm.stake_amount}
                        onChange={e => setCreateForm(f => ({ ...f, stake_amount: parseInt(e.target.value) || 500 }))}
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 font-bold focus:border-orange-400 outline-none transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Duration (days)</label>
                    <input type="number" min={7} max={42} step={7} value={createForm.duration_days}
                      onChange={e => setCreateForm(f => ({ ...f, duration_days: parseInt(e.target.value) || 7 }))}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 font-bold focus:border-orange-400 outline-none transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Max Members</label>
                  <input type="number" min={2} max={50} value={createForm.max_members}
                    onChange={e => setCreateForm(f => ({ ...f, max_members: parseInt(e.target.value) || 2 }))}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 font-bold focus:border-orange-400 outline-none transition-colors" />
                </div>

                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-xs text-stone-500 font-medium mb-1">How it works</p>
                  <p className="text-sm text-stone-700 font-semibold">
                    Everyone stakes {formatCurrency(createForm.stake_amount)}. Quitters lose their money.
                    Winners split the forfeited pool based on completion rate. Platform takes 10%.
                  </p>
                </div>

                <button onClick={handleCreate} disabled={creating}
                  className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold transition-all disabled:opacity-50">
                  {creating ? "Creating..." : "Create Group"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
