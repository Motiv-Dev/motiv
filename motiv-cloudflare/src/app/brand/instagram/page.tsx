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
      a.download = `motiv-${id}-${Date.now()}.png`;
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
      <div ref={ref} className="w-full aspect-square max-w-[540px] mx-auto">
        {children}
      </div>
    </section>
  );
}

export default function InstagramTemplates() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <nav className="sticky top-0 z-50 bg-[#faf9f7]/80 backdrop-blur-xl border-b border-stone-200/50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/brand" className="p-2 rounded-xl hover:bg-stone-100 text-stone-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-stone-900">Instagram Templates</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-16">
        {/* Template 1: User Stake Card */}
        <Template id="ig-stake" label="1. User Stake Card">
          <div className="w-full h-full bg-[#1c1917] rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="relative z-10">
              <p className="text-xl font-script text-orange-500 transform -rotate-2 mb-8">Motiv</p>
              <p className="text-stone-500 text-sm font-semibold uppercase tracking-widest mb-3">I STAKED</p>
              <p className="text-7xl font-black text-white leading-none mb-2">$1,000</p>
              <p className="text-stone-500 text-lg font-medium">on going to the gym</p>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-6">
                <div>
                  <p className="text-4xl font-black text-orange-500">14</p>
                  <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Day Streak</p>
                </div>
                <div className="w-px h-10 bg-stone-800" />
                <div>
                  <p className="text-4xl font-black text-emerald-500">21</p>
                  <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">of 30 Days</p>
                </div>
              </div>
              <p className="text-stone-600 text-xs font-medium">motiv.app — Execute or Forfeit</p>
            </div>
          </div>
        </Template>

        {/* Template 2: Burn Stats */}
        <Template id="ig-burn" label="2. Weekly Burn Stats">
          <div className="w-full h-full bg-[#1c1917] rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
            <div className="relative z-10">
              <p className="text-xl font-script text-orange-500 transform -rotate-2 mb-4">Motiv</p>
              <p className="text-stone-500 text-sm font-semibold uppercase tracking-widest">THIS WEEK ON MOTIV</p>
            </div>
            <div className="relative z-10 text-center py-6">
              <p className="text-8xl font-black text-red-500 leading-none mb-2">$4,200</p>
              <p className="text-xl text-stone-400 font-semibold">burned by quitters</p>
            </div>
            <div className="relative z-10">
              <div className="flex justify-between text-center">
                <div>
                  <p className="text-2xl font-black text-white">156</p>
                  <p className="text-xs text-stone-500 font-semibold">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-500">89%</p>
                  <p className="text-xs text-stone-500 font-semibold">Completion</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-orange-500">23</p>
                  <p className="text-xs text-stone-500 font-semibold">Avg Streak</p>
                </div>
              </div>
              <p className="text-stone-600 text-xs font-medium mt-6 text-center">Don&apos;t end up here. motiv.app</p>
            </div>
          </div>
        </Template>

        {/* Template 3: Motivation Quote */}
        <Template id="ig-quote" label="3. Motivation Quote">
          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="relative z-10">
              <p className="text-xl font-script text-white/90 transform -rotate-2">Motiv</p>
            </div>
            <div className="relative z-10 text-center">
              <p className="text-4xl font-black text-white leading-tight mb-6">
                &ldquo;The pain of discipline weighs ounces. The pain of regret weighs tons.&rdquo;
              </p>
              <p className="text-white/70 font-semibold">— Jim Rohn</p>
            </div>
            <div className="relative z-10 text-center">
              <p className="text-white/60 text-sm font-semibold">Your excuses just got expensive.</p>
            </div>
          </div>
        </Template>

        {/* Template 4: Launch Announcement */}
        <Template id="ig-launch" label="4. Launch Announcement">
          <div className="w-full h-full bg-[#1c1917] rounded-3xl p-10 flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px]" />
            <div className="relative z-10 text-center">
              <p className="text-7xl font-script text-orange-500 transform -rotate-3 mb-6">Motiv</p>
              <p className="text-white text-2xl font-black mb-3">is LIVE.</p>
              <div className="w-12 h-0.5 bg-orange-500 mx-auto mb-6" />
              <p className="text-stone-400 text-lg font-medium max-w-xs">
                Stake real money on your habits. Miss a day, lose real cash.
              </p>
              <div className="mt-8 inline-block px-8 py-3 bg-white rounded-xl">
                <p className="text-stone-900 font-black text-sm">JOIN NOW — motiv.app</p>
              </div>
            </div>
          </div>
        </Template>
      </div>
    </div>
  );
}
