"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, CreditCard, ShieldCheck, LogOut, ArrowRight, Flame, Target, TrendingUp, Activity } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data: any = await res.json();
        setStats(data.stats);
        setIsLoggedIn(true);
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      setIsLoggedIn(true);
      checkAuth();
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    document.cookie = "motiv-admin-token=; Max-Age=0; path=/";
    setIsLoggedIn(false);
    setStats(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111]">
        <div className="text-4xl font-script text-orange-500 animate-pulse-soft transform -rotate-2">Motiv</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-12">
            <p className="text-5xl font-script text-orange-500 transform -rotate-2">Motiv</p>
            <p className="mt-3 text-stone-500 text-sm font-medium">Admin</p>
          </div>
          {loginError && <div className="mb-6 p-4 rounded-2xl bg-red-900/30 text-red-400 text-sm font-medium">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required value={loginForm.email}
              onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-5 py-4 rounded-2xl border border-stone-800 bg-stone-900 text-white font-medium focus:border-orange-500 outline-none transition-colors"
              placeholder="admin@motiv.app" />
            <input type="password" required value={loginForm.password}
              onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-5 py-4 rounded-2xl border border-stone-800 bg-stone-900 text-white font-medium focus:border-orange-500 outline-none transition-colors"
              placeholder="Password" />
            <button type="submit" disabled={loginLoading}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all disabled:opacity-50">
              {loginLoading ? "..." : "Log in"}
            </button>
          </form>
          <p className="mt-4 text-xs text-stone-600 text-center">Use your admin credentials</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin/payments", label: "Payments", icon: CreditCard, count: stats?.pendingPayments, desc: "Verify deposits" },
    { href: "/admin/proofs", label: "Proofs", icon: ShieldCheck, count: stats?.pendingProofs, desc: "Review daily proofs" },
    { href: "/admin/stakes", label: "Stakes", icon: Target, count: stats?.activeStakes, desc: "Manage all stakes" },
    { href: "/admin/users", label: "Users", icon: Users, count: stats?.totalUsers, desc: "Manage accounts" },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: CreditCard, count: 0, desc: "Process refunds" },
  ];

  function getActivityIcon(type: string) {
    switch (type) {
      case "proof": return "📸";
      case "payment": return "💳";
      case "stake": return "🎯";
      default: return "📌";
    }
  }

  function getActivityText(event: any) {
    switch (event.event_type) {
      case "proof":
        return `${event.user_name} submitted day ${event.day_number} proof for ${event.habit_type}`;
      case "payment":
        return `${event.user_name} ${event.type === "deposit" ? "deposited" : "withdrew"} ${formatCurrency(event.amount)}`;
      case "stake":
        return `${event.user_name} created ${event.habit_type} stake — ${formatCurrency(event.amount)}`;
      default:
        return "Unknown event";
    }
  }

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <nav className="border-b border-stone-800">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-script text-orange-500 transform -rotate-2">Motiv</span>
          <button onClick={handleLogout} className="text-sm text-stone-500 hover:text-stone-300 transition-colors flex items-center gap-2 font-medium">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-10">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Users", value: stats?.totalUsers || 0 },
            { label: "Active Stakes", value: stats?.activeStakes || 0 },
            { label: "Total Staked", value: formatCurrency(stats?.totalStaked || 0) },
            { label: "Platform Fees", value: formatCurrency(stats?.platformFees || 0), highlight: true },
            { label: "Burns", value: formatCurrency(stats?.totalBurned || 0) },
            { label: "Total Revenue", value: formatCurrency(stats?.totalRevenue || 0), highlight: true },
          ].map((item, i) => (
            <div key={i} className={`bg-stone-900 rounded-2xl p-5 border ${item.highlight ? "border-orange-500/30" : "border-stone-800"}`}>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mb-2">{item.label}</p>
              <p className={`text-2xl font-black ${item.highlight ? "text-orange-400" : ""}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: "Completed", value: stats?.completedStakes || 0, color: "text-emerald-400" },
            { label: "Failed", value: stats?.failedStakes || 0, color: "text-red-400" },
            { label: "Today's Proofs", value: stats?.todayProofs || 0, color: "text-blue-400" },
          ].map((item, i) => (
            <div key={i} className="bg-stone-900 rounded-2xl p-4 border border-stone-800">
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mb-1">{item.label}</p>
              <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Nav */}
        <div className="space-y-3 mb-10">
          {navItems.map((item, i) => (
            <Link key={i} href={item.href}
              className="flex items-center gap-4 bg-stone-900 rounded-2xl border border-stone-800 p-5 hover:border-orange-500/50 transition-all group">
              <item.icon className="w-5 h-5 text-stone-500 group-hover:text-orange-500 transition-colors" />
              <div className="flex-1">
                <p className="font-bold">{item.label}</p>
                <p className="text-xs text-stone-500">{item.desc}</p>
              </div>
              {(item.count || 0) > 0 && (
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">{item.count}</span>
              )}
              <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>

        {/* Activity Feed */}
        {stats?.recentActivity?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-stone-500" />
              <h2 className="text-lg font-bold">Recent Activity</h2>
            </div>
            <div className="space-y-2">
              {stats.recentActivity.map((event: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-stone-900/50 rounded-xl border border-stone-800/50 p-3">
                  <span className="text-lg">{getActivityIcon(event.event_type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-300 truncate">{getActivityText(event)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      event.status === "approved" || event.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                      event.status === "submitted" || event.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                      event.status === "rejected" || event.status === "failed" ? "bg-red-500/20 text-red-400" :
                      "bg-stone-700 text-stone-400"
                    }`}>
                      {event.status}
                    </span>
                    <span className="text-[10px] text-stone-600">{formatDate(event.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
