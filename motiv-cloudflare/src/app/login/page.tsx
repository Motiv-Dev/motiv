"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#faf9f7]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <Link href="/" className="text-6xl font-script text-orange-500 inline-block transform -rotate-2 drop-shadow-sm hover:scale-105 transition-transform">
            Motiv
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-stone-900 mb-8">Welcome back</h1>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border-2 border-stone-200 bg-white text-stone-900 font-medium focus:border-orange-400 focus:ring-0 outline-none transition-colors text-base"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Password</label>
            <input type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border-2 border-stone-200 bg-white text-stone-900 font-medium focus:border-orange-400 focus:ring-0 outline-none transition-colors text-base"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-base transition-all disabled:opacity-50 hover:shadow-lg mt-2">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-400">
          New here? <Link href="/signup" className="text-orange-500 font-semibold hover:text-orange-600">Create account</Link>
        </p>
      </div>
    </div>
  );
}
