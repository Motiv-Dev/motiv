"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [viewImage, setViewImage] = useState<string | null>(null);

  useEffect(() => { fetchPayments(); }, []);

  async function fetchPayments() {
    const res = await fetch("/api/admin/payments");
    if (res.ok) {
      const data: any = await res.json();
      setPayments(data.payments);
    }
    setLoading(false);
  }

  async function updatePayment(id: number, status: string, notes?: string) {
    await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id: id, status, admin_notes: notes }),
    });
    fetchPayments();
  }

  const filtered = payments.filter(p => filter === "all" || p.status === filter);

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <nav className="border-b border-stone-800">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/admin" className="p-2 rounded-xl hover:bg-stone-800 text-stone-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold">Payments</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8">
          {["pending", "approved", "rejected", "all"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                filter === f ? "bg-white text-stone-900" : "bg-stone-900 text-stone-400 hover:text-white border border-stone-800"
              }`}>{f}</button>
          ))}
        </div>

        {viewImage && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setViewImage(null)}>
            <img src={viewImage} alt="Payment" className="max-w-full max-h-[80vh] rounded-2xl" />
          </div>
        )}

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-20 text-stone-500">No {filter} payments.</div>
          )}
          {filtered.map(p => (
            <div key={p.id} className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold">{p.user_name}</p>
                  <p className="text-xs text-stone-500">{p.user_email} · {p.type} · {formatDate(p.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black">{formatCurrency(p.amount)}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                    p.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                    p.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>{p.status}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {p.screenshot_url && (
                  <button onClick={() => setViewImage(`/api${p.screenshot_url}`)}
                    className="text-xs bg-stone-800 px-3 py-1.5 rounded-lg text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold">
                    <Eye className="w-3 h-3" /> Screenshot
                  </button>
                )}
                {p.status === "pending" && (
                  <>
                    <button onClick={() => updatePayment(p.id, "approved")}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1">
                      <Check className="w-3 h-3" /> Approve
                    </button>
                    <button onClick={() => updatePayment(p.id, "rejected", "Payment not verified")}
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1">
                      <X className="w-3 h-3" /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
