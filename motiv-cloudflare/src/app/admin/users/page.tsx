"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Ban, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [userStakes, setUserStakes] = useState<Record<number, any[]>>({});
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r: any) => r.json())
      .then((d: any) => setUsers(d.users || []))
      .finally(() => setLoading(false));
  }, []);

  async function toggleBan(userId: number, currentlyBanned: boolean) {
    const action = currentlyBanned ? "unban" : "ban";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    setActionLoading(userId);
    try {
      await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, ban: !currentlyBanned }),
      });
      setUsers(users.map(u => u.id === userId ? { ...u, banned: currentlyBanned ? 0 : 1 } : u));
    } finally {
      setActionLoading(null);
    }
  }

  async function toggleExpand(userId: number) {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    if (!userStakes[userId]) {
      const res = await fetch(`/api/admin/stakes?user_id=${userId}`);
      const data: any = await res.json();
      setUserStakes(prev => ({ ...prev, [userId]: data.stakes || [] }));
    }
  }

  const filteredUsers = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    active: "text-emerald-400",
    completed: "text-blue-400",
    failed: "text-red-400",
    pending_payment: "text-amber-400",
    cancelled: "text-stone-500",
  };

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <nav className="border-b border-stone-800">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/admin" className="p-2 rounded-xl hover:bg-stone-800 text-stone-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold">Users</span>
          <span className="ml-auto text-sm text-stone-500">{filteredUsers.length} users</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-stone-800 bg-stone-900 text-white font-medium focus:border-orange-500 outline-none transition-colors"
          />
        </div>

        <div className="space-y-3">
          {filteredUsers.map(u => (
            <div key={u.id} className={`bg-stone-900 rounded-2xl border ${u.banned ? "border-red-500/30" : "border-stone-800"} overflow-hidden`}>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{u.name}</p>
                        {u.banned ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 uppercase">Banned</span>
                        ) : null}
                      </div>
                      <p className="text-xs text-stone-500">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleBan(u.id, !!u.banned)} disabled={actionLoading === u.id}
                      className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                        u.banned ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      }`} title={u.banned ? "Unban" : "Ban"}>
                      {u.banned ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </button>
                    <button onClick={() => toggleExpand(u.id)}
                      className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 transition-all">
                      {expandedUser === u.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-6 mt-3">
                  <div>
                    <p className="text-xs text-stone-500">Stakes</p>
                    <p className="font-bold text-sm">{u.total_stakes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Staked</p>
                    <p className="font-bold text-sm text-emerald-400">{formatCurrency(u.total_staked)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Burned</p>
                    <p className="font-bold text-sm text-red-400">{formatCurrency(u.total_burned)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Joined</p>
                    <p className="font-bold text-sm text-stone-400">{formatDate(u.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Expanded: User's Stakes */}
              {expandedUser === u.id && (
                <div className="border-t border-stone-800 bg-stone-950/50 p-5">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Stakes History</p>
                  {userStakes[u.id]?.length ? (
                    <div className="space-y-2">
                      {userStakes[u.id].map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between py-2 border-b border-stone-800/50 last:border-0">
                          <div>
                            <p className="text-sm font-semibold capitalize">{s.habit_type?.replace("_", " ")}</p>
                            <p className="text-xs text-stone-500">{s.duration_days} days · {formatCurrency(s.total_amount)}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-bold capitalize ${statusColors[s.status] || "text-stone-500"}`}>
                              {s.status?.replace("_", " ")}
                            </span>
                            <p className="text-[10px] text-stone-600">{s.completed_days || 0}/{s.duration_days} days</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-600">No stakes found.</p>
                  )}
                </div>
              )}
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-20 text-stone-500">
              {search ? "No users match your search." : "No users yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
