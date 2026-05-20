"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";

function Template({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!ref.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `motiv-linkedin-${id}-${Date.now()}.png`;
      a.click();
    } catch (e) {
      console.error(e);
    }
    setDownloading(false);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-stone-900">{label}</h3>
        <button onClick={handleDownload} disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50">
          <Download className="w-4 h-4" />
          {downloading ? "..." : "Download PNG"}
        </button>
      </div>
      <div ref={ref} className="w-full" style={{ aspectRatio: "1200/627" }}>
        {children}
      </div>
    </section>
  );
}

export default function LinkedInTemplates() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <nav className="sticky top-0 z-50 bg-[#faf9f7]/80 backdrop-blur-xl border-b border-stone-200/50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/brand" className="p-2 rounded-xl hover:bg-stone-100 text-stone-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-stone-900">LinkedIn Templates</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Launch Post */}
        <Template id="launch" label="1. Launch Announcement">
          <div className="w-full h-full bg-[#1c1917] rounded-2xl p-12 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-[80px] -mr-20 -mt-20" />
            <div className="relative z-10 max-w-md">
              <p className="text-3xl font-script text-orange-500 transform -rotate-2 mb-6">Motiv</p>
              <h2 className="text-4xl font-black text-white leading-tight mb-4">We just launched.</h2>
              <p className="text-stone-400 text-lg font-medium mb-8">
                Stake real money on your habits. Miss a day — lose real cash. Built for people who are done making excuses.
              </p>
              <div className="inline-block px-6 py-3 bg-orange-500 rounded-xl">
                <p className="text-white font-bold">Try it free — motiv.app</p>
              </div>
            </div>
            <div className="relative z-10 hidden md:flex flex-col items-center gap-4">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-center">
                <p className="text-5xl font-black text-orange-500 mb-1">89%</p>
                <p className="text-xs text-stone-500 font-semibold uppercase">Completion Rate</p>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-center">
                <p className="text-5xl font-black text-emerald-500 mb-1">21d</p>
                <p className="text-xs text-stone-500 font-semibold uppercase">Avg Streak</p>
              </div>
            </div>
          </div>
        </Template>

        {/* Traction Update */}
        <Template id="traction" label="2. Traction / Stats Update">
          <div className="w-full h-full bg-[#1c1917] rounded-2xl p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-script text-orange-500 transform -rotate-2">Motiv</p>
              <p className="text-stone-600 text-sm font-semibold">Week 4 Update</p>
            </div>
            <div className="flex items-center justify-between gap-8">
              {[
                { value: "500+", label: "Users", color: "text-white" },
                { value: "$12K", label: "Staked", color: "text-orange-500" },
                { value: "89%", label: "Completion", color: "text-emerald-500" },
                { value: "$1.2K", label: "Burned", color: "text-red-500" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-5xl font-black ${s.color} mb-1`}>{s.value}</p>
                  <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-stone-600 text-sm font-medium">
              Loss aversion is the best coach. motiv.app — Execute or Forfeit.
            </p>
          </div>
        </Template>

        {/* How it Works */}
        <Template id="how-it-works" label="3. How It Works">
          <div className="w-full h-full bg-[#1c1917] rounded-2xl p-12 flex flex-col justify-between relative overflow-hidden">
            <div>
              <p className="text-2xl font-script text-orange-500 transform -rotate-2 mb-2">Motiv</p>
              <p className="text-3xl font-black text-white">How it works</p>
            </div>
            <div className="flex items-start gap-8">
              {[
                { step: "01", title: "Stake", desc: "Lock real money on a habit. ₹500 to ₹5,000." },
                { step: "02", title: "Execute", desc: "Complete your daily task before the countdown ends." },
                { step: "03", title: "Verify", desc: "Upload proof. AI verifies your submission." },
              ].map((s) => (
                <div key={s.step} className="flex-1">
                  <p className="text-orange-500 font-script text-xl mb-2">Step {s.step}</p>
                  <p className="text-white font-black text-lg mb-1">{s.title}</p>
                  <p className="text-stone-500 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-stone-600 text-xs font-medium">
              Your excuses just got expensive. motiv.app
            </p>
          </div>
        </Template>
      </div>
    </div>
  );
}
