"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Eye, Sparkles, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminProofs() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("submitted");
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  useEffect(() => { fetchProofs(); }, []);

  async function fetchProofs() {
    const res = await fetch("/api/admin/proofs");
    if (res.ok) {
      const data: any = await res.json();
      setProofs(data.proofs);
    }
    setLoading(false);
  }

  async function updateProof(id: number, status: string, notes?: string) {
    await fetch("/api/admin/proofs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proof_id: id, status, admin_notes: notes }),
    });
    fetchProofs();
  }

  async function aiVerify(proofId: number) {
    setVerifying(proofId);
    setVerifyResult(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof_id: proofId }),
      });
      const data: any = await res.json();
      setVerifyResult({ proofId, ...data.verification });
      if (data.verification.autoStatus) fetchProofs();
    } catch (e: any) {
      setVerifyResult({ proofId, error: e.message });
    } finally {
      setVerifying(null);
    }
  }

  const filtered = proofs.filter(p => filter === "all" || p.status === filter);

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <nav className="border-b border-stone-800">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/admin" className="p-2 rounded-xl hover:bg-stone-800 text-stone-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold">Proofs</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {["submitted", "approved", "rejected", "missed", "all"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
                filter === f ? "bg-white text-stone-900" : "bg-stone-900 text-stone-400 hover:text-white border border-stone-800"
              }`}>{f}</button>
          ))}
        </div>

        {/* Image viewer */}
        {viewImage && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setViewImage(null)}>
            <img src={viewImage} alt="Proof" className="max-w-full max-h-[80vh] rounded-2xl" />
          </div>
        )}

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-20 text-stone-500">No {filter} proofs.</div>
          )}
          {filtered.map(p => (
            <div key={p.id} className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold">{p.user_name}</p>
                  <p className="text-xs text-stone-500">{p.user_email} · Day {p.day_number} · {formatCurrency(p.daily_amount)} at risk</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                  p.status === "submitted" ? "bg-amber-500/20 text-amber-400" :
                  p.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                  "bg-red-500/20 text-red-400"
                }`}>{p.status}</span>
              </div>

              {/* Quick info */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {p.keyword && <span className="text-xs bg-stone-800 px-2 py-1 rounded-lg font-mono">{p.keyword}</span>}
                {p.photo_url && <button onClick={() => setViewImage(`/api${p.photo_url}`)} className="text-xs bg-stone-800 px-2 py-1 rounded-lg text-blue-400 hover:text-blue-300 flex items-center gap-1"><Eye className="w-3 h-3" /> Photo</button>}
                {p.screentime_url && <button onClick={() => setViewImage(`/api${p.screentime_url}`)} className="text-xs bg-stone-800 px-2 py-1 rounded-lg text-blue-400 hover:text-blue-300 flex items-center gap-1"><Eye className="w-3 h-3" /> Screen</button>}
                {p.gps_lat && <span className="text-xs bg-stone-800 px-2 py-1 rounded-lg text-stone-400">GPS ✓</span>}
              </div>

              {/* AI Result */}
              {verifyResult && verifyResult.proofId === p.id && (
                <div className="mb-3 p-3 rounded-xl bg-stone-800 border border-stone-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Verification</span>
                    <span className={`text-xs font-black ${
                      verifyResult.score >= 80 ? "text-emerald-400" : verifyResult.score >= 50 ? "text-amber-400" : "text-red-400"
                    }`}>{verifyResult.score}/100</span>
                  </div>
                  {verifyResult.checks?.map((c: any, ci: number) => (
                    <div key={ci} className="flex items-center gap-2 text-xs py-0.5">
                      {c.passed ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-red-400" />}
                      <span className="text-stone-400">{c.name}</span>
                    </div>
                  ))}
                  {verifyResult.autoStatus && (
                    <p className="mt-2 text-xs text-purple-400 font-bold">Auto-{verifyResult.autoStatus}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              {p.status === "submitted" && (
                <div className="flex gap-2">
                  <button onClick={() => aiVerify(p.id)} disabled={verifying === p.id}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1">
                    {verifying === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    AI
                  </button>
                  <button onClick={() => updateProof(p.id, "approved")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1">
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button onClick={() => updateProof(p.id, "rejected", "Proof not valid")}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1">
                    <X className="w-3 h-3" /> Reject
                  </button>
                  <button onClick={() => updateProof(p.id, "missed")}
                    className="px-4 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold transition-all">
                    Missed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
