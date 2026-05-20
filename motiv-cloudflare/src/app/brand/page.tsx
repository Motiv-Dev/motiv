"use client";

import Link from "next/link";
import { ArrowLeft, Copy, Check, Download, Type, Palette, Image } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

const COLORS = [
  { name: "Motiv Orange", hex: "#f97316", class: "bg-orange-500" },
  { name: "Stone 900", hex: "#1c1917", class: "bg-stone-900" },
  { name: "Stone 800", hex: "#292524", class: "bg-stone-800" },
  { name: "Cream", hex: "#faf9f7", class: "bg-[#faf9f7]" },
  { name: "Stone 400", hex: "#a8a29e", class: "bg-stone-400" },
  { name: "Red 500", hex: "#ef4444", class: "bg-red-500" },
  { name: "Emerald 500", hex: "#22c55e", class: "bg-emerald-500" },
];

const TAGLINES = [
  "Execute or Forfeit.",
  "Your excuses just got expensive.",
  "Stake real money. Build real discipline.",
  "Miss a day. Lose real money.",
  "Skin in the game.",
];

const THEMES = [
  { id: "dark", label: "Dark", bg: "#1c1917", text: "#ffffff", accent: "#f97316", subtitle: "#78716c" },
  { id: "orange", label: "Orange", bg: "#f97316", text: "#ffffff", accent: "#ffffff", subtitle: "rgba(255,255,255,0.7)" },
  { id: "cream", label: "Cream", bg: "#faf9f7", text: "#1c1917", accent: "#f97316", subtitle: "#78716c" },
  { id: "dark-orange", label: "Dark + Orange", bg: "#292524", text: "#f97316", accent: "#ffffff", subtitle: "#a8a29e" },
];

const POST_FORMATS = [
  { id: "square", label: "Instagram", width: 1080, height: 1080 },
  { id: "story", label: "Story", width: 1080, height: 1920 },
  { id: "linkedin", label: "LinkedIn", width: 1200, height: 627 },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 rounded hover:bg-stone-200 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-stone-400" />}
    </button>
  );
}

function PostGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState(THEMES[0]);
  const [format, setFormat] = useState(POST_FORMATS[0]);
  const [headline, setHeadline] = useState("Execute or Forfeit.");
  const [body, setBody] = useState("Stake real money on your habits.\nMiss a day — lose real cash.");
  const [showLogo, setShowLogo] = useState(true);
  const [showTagline, setShowTagline] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = 2;
    const w = format.width;
    const h = format.height;
    canvas.width = w * scale;
    canvas.height = h * scale;
    canvas.style.width = "100%";
    canvas.style.height = "auto";

    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, w, h);

    // Accent glow
    const glow = ctx.createRadialGradient(w * 0.8, h * 0.2, 0, w * 0.8, h * 0.2, w * 0.5);
    glow.addColorStop(0, theme.accent + "15");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Orange top bar
    ctx.fillStyle = theme.accent;
    ctx.fillRect(0, 0, w, 6);

    const pad = w * 0.08;
    const contentW = w - pad * 2;

    // Logo — match the Motiv brand styling (Pacifico-like, rotated)
    if (showLogo) {
      ctx.save();
      ctx.translate(pad + w * 0.06, pad + w * 0.03);
      ctx.rotate(-2 * Math.PI / 180); // -2deg rotation like the real logo
      ctx.font = `${w * 0.06}px Pacifico, cursive`;
      ctx.fillStyle = theme.accent;
      ctx.textBaseline = "top";
      ctx.shadowColor = "rgba(0,0,0,0.1)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.fillText("Motiv", 0, 0);
      ctx.restore();
    }

    // Headline
    ctx.font = `900 ${w * 0.08}px -apple-system, system-ui, sans-serif`;
    ctx.fillStyle = theme.text;
    ctx.textBaseline = "top";

    const headlineY = h * 0.35;
    const headlineLines = headline.split("\n");
    headlineLines.forEach((line, i) => {
      ctx.fillText(line, pad, headlineY + i * (w * 0.1));
    });

    // Body
    ctx.font = `500 ${w * 0.035}px -apple-system, system-ui, sans-serif`;
    ctx.fillStyle = theme.subtitle;
    const bodyY = headlineY + headlineLines.length * (w * 0.1) + w * 0.04;
    const bodyLines = body.split("\n");
    bodyLines.forEach((line, i) => {
      ctx.fillText(line, pad, bodyY + i * (w * 0.055));
    });

    // Bottom tagline
    if (showTagline) {
      ctx.font = `600 ${w * 0.022}px -apple-system, system-ui, sans-serif`;
      ctx.fillStyle = theme.subtitle;
      ctx.fillText("motiv.app — Your excuses just got expensive", pad, h - pad);
    }
  }, [theme, format, headline, body, showLogo, showTagline]);

  // Redraw whenever state changes
  useEffect(() => { const t = setTimeout(drawCanvas, 100); return () => clearTimeout(t); }, [drawCanvas]);

  const handleDownload = () => {
    drawCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);

    canvas.toBlob((blob) => {
      if (!blob) { setDownloading(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `motiv-${format.id}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, "image/png");
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100">
        <h3 className="text-xl font-bold text-stone-900 mb-1">Post Generator</h3>
        <p className="text-sm text-stone-400">Create branded posts and download as PNG</p>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Controls */}
        <div className="p-6 space-y-6 border-r border-stone-100">
          {/* Format */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Format</label>
            <div className="flex gap-2">
              {POST_FORMATS.map((f) => (
                <button key={f.id} onClick={() => { setFormat(f); setTimeout(drawCanvas, 50); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${format.id === f.id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">
              <Palette className="w-3 h-3 inline mr-1" />Theme
            </label>
            <div className="flex gap-2">
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => { setTheme(t); setTimeout(drawCanvas, 50); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${theme.id === t.id ? "ring-2 ring-orange-500 ring-offset-2" : ""}`}>
                  <span className="w-4 h-4 rounded-full border border-stone-200" style={{ background: t.bg }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">
              <Type className="w-3 h-3 inline mr-1" />Headline
            </label>
            <textarea value={headline} onChange={(e) => { setHeadline(e.target.value); setTimeout(drawCanvas, 50); }}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 font-bold focus:border-orange-400 outline-none transition-colors resize-none"
              placeholder="Your headline here..." />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Body Text</label>
            <textarea value={body} onChange={(e) => { setBody(e.target.value); setTimeout(drawCanvas, 50); }}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:border-orange-400 outline-none transition-colors resize-none"
              placeholder="Description text..." />
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showLogo} onChange={(e) => { setShowLogo(e.target.checked); setTimeout(drawCanvas, 50); }}
                className="rounded border-stone-300 text-orange-500 focus:ring-orange-500" />
              <span className="text-sm font-medium text-stone-700">Logo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showTagline} onChange={(e) => { setShowTagline(e.target.checked); setTimeout(drawCanvas, 50); }}
                className="rounded border-stone-300 text-orange-500 focus:ring-orange-500" />
              <span className="text-sm font-medium text-stone-700">Tagline</span>
            </label>
          </div>

          {/* Quick fill buttons */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Quick Templates</label>
            <div className="flex flex-wrap gap-2">
              {[
                { h: "Execute or Forfeit.", b: "Stake real money on your habits.\nMiss a day — lose real cash." },
                { h: "We just launched.", b: "Motiv is live.\nStake money. Build discipline.\nNo excuses." },
                { h: "I staked ₹2000\non going to the gym.", b: "Day 14 of 30.\n14-day streak and counting." },
                { h: "₹4,200 burned\nthis week.", b: "Don't end up on the\nWall of Shame." },
              ].map((t, i) => (
                <button key={i} onClick={() => { setHeadline(t.h); setBody(t.b); setTimeout(drawCanvas, 50); }}
                  className="px-3 py-1.5 rounded-lg bg-stone-50 text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors">
                  {t.h.split("\n")[0].slice(0, 25)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview + Download */}
        <div className="p-6 bg-stone-50 flex flex-col">
          <div className="flex-1 flex items-center justify-center mb-4">
            <canvas ref={canvasRef} className="rounded-xl shadow-lg max-h-[500px] border border-stone-200" />
          </div>
          <button onClick={handleDownload} disabled={downloading}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            {downloading ? "Generating..." : `Download PNG (${format.width}x${format.height})`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <nav className="sticky top-0 z-50 bg-[#faf9f7]/80 backdrop-blur-xl border-b border-stone-200/50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 rounded-xl hover:bg-stone-100 text-stone-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-stone-900">Brand Kit</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Post Generator — first, most useful */}
        <PostGenerator />

        {/* Logo */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-6">Logo</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#faf9f7] border border-stone-200 rounded-2xl p-10 flex items-center justify-center">
              <span className="text-6xl font-script text-orange-500 transform -rotate-2">Motiv</span>
            </div>
            <div className="bg-[#1c1917] rounded-2xl p-10 flex items-center justify-center">
              <span className="text-6xl font-script text-orange-500 transform -rotate-2">Motiv</span>
            </div>
            <div className="bg-orange-500 rounded-2xl p-10 flex items-center justify-center">
              <span className="text-6xl font-script text-white transform -rotate-2">Motiv</span>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-10 flex items-center justify-center">
              <span className="text-6xl font-script text-stone-900 transform -rotate-2">Motiv</span>
            </div>
          </div>

          {/* SVG Logo Downloads */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <a href="/motiv-logo.svg" download="motiv-logo-orange.svg"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">
              <Download className="w-4 h-4" /> Logo SVG
            </a>
            <a href="/motiv-logo-dark.svg" download="motiv-logo-dark.svg"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">
              <Download className="w-4 h-4" /> Logo Dark
            </a>
            <a href="/favicon.svg" download="motiv-favicon.svg"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors">
              <Download className="w-4 h-4" /> Favicon
            </a>
          </div>
        </section>

        {/* Colors */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {COLORS.map((c) => (
              <div key={c.hex} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <div className={`${c.class} h-20`} />
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-stone-900">{c.name}</p>
                    <p className="text-xs text-stone-400 font-mono">{c.hex}</p>
                  </div>
                  <CopyButton text={c.hex} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-6">Typography</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-8">
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-3">Display — Pacifico</p>
              <p className="text-5xl font-script text-stone-900 transform -rotate-1">Execute or Forfeit.</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-8">
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-3">Body — Inter</p>
              <p className="text-2xl font-bold text-stone-900 mb-2">Your excuses just got expensive.</p>
              <p className="text-base text-stone-500">Stake real money on your habits. Complete daily proof or lose your capital.</p>
            </div>
          </div>
        </section>

        {/* Taglines */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-6">Taglines</h2>
          <div className="space-y-2">
            {TAGLINES.map((t) => (
              <div key={t} className="flex items-center justify-between bg-white rounded-xl border border-stone-200 px-5 py-3">
                <p className="font-bold text-stone-800">{t}</p>
                <CopyButton text={t} />
              </div>
            ))}
          </div>
        </section>

        {/* Template Gallery Links */}
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-6">Template Gallery</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/brand/instagram" className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-orange-300 transition-colors text-center">
              <p className="text-3xl mb-2"><Image className="w-8 h-8 mx-auto text-orange-500" /></p>
              <p className="font-bold text-stone-900">Instagram</p>
              <p className="text-xs text-stone-400">1080 x 1080 templates</p>
            </Link>
            <Link href="/brand/linkedin" className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-orange-300 transition-colors text-center">
              <p className="text-3xl mb-2"><Image className="w-8 h-8 mx-auto text-blue-500" /></p>
              <p className="font-bold text-stone-900">LinkedIn</p>
              <p className="text-xs text-stone-400">1200 x 627 templates</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
