"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Flame, BookOpen, Dumbbell, Upload, ArrowLeft, MapPin, Check,
  Code2, Target
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface VerificationMethod {
  method: string;
  label: string;
  description: string;
  requiresConfig: boolean;
  configFields?: { key: string; label: string; placeholder: string }[];
}

function NewStakeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const payStakeId = searchParams.get("pay");
  const payAmount = searchParams.get("amount");

  const [step, setStep] = useState(payStakeId ? 3 : 1);
  const [form, setForm] = useState({
    habit_type: "fitness",
    habit_description: "",
    total_amount: 500,
    duration_days: 21,
    days_per_week: 7,
    active_days: [0, 1, 2, 3, 4, 5, 6] as number[],
    gym_name: "",
    gym_lat: 0,
    gym_lng: 0,
  });

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function toggleActiveDay(dayIdx: number) {
    setForm(f => {
      const newDays = f.active_days.includes(dayIdx)
        ? f.active_days.filter(d => d !== dayIdx)
        : [...f.active_days, dayIdx].sort();
      return { ...f, active_days: newDays, days_per_week: newDays.length };
    });
  }

  function setDaysPerWeek(count: number) {
    // Auto-select first N days starting from Monday
    const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun
    const selected = dayOrder.slice(0, count);
    setForm(f => ({ ...f, days_per_week: count, active_days: selected.sort() }));
  }

  // Calculate actual proof days in the duration
  function getProofDaysCount() {
    if (form.days_per_week === 7) return form.duration_days;
    const totalWeeks = Math.floor(form.duration_days / 7);
    const remainingDays = form.duration_days % 7;
    let count = totalWeeks * form.days_per_week;
    // Count remaining days that fall on active days
    const startDow = new Date().getDay();
    for (let i = 0; i < remainingDays; i++) {
      if (form.active_days.includes((startDow + totalWeeks * 7 + i) % 7)) count++;
    }
    return Math.max(count, 1);
  }
  const [selectedMethods, setSelectedMethods] = useState<{ method: string; config: Record<string, string> }[]>([]);
  const [stakeId, setStakeId] = useState<number | null>(payStakeId ? parseInt(payStakeId) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  const screenshotRef = useRef<HTMLInputElement>(null);

  const UPI_ID = "subhangladha@oksbi";

  function getPlatformFee(amount: number) {
    if (amount >= 10000) return 99;
    if (amount >= 5000) return 69;
    if (amount >= 2500) return 49;
    if (amount >= 1000) return 29;
    if (amount >= 500) return 19;
    return 9;
  }

  const habitTypes = [
    {
      id: "fitness", label: "Fitness", icon: Dumbbell, emoji: "💪",
      desc: "Gym, calisthenics, yoga, sports",
      suggestions: ["Going to the gym", "Home workout", "Yoga / Stretching", "Swimming", "Playing a sport"],
      tip: "Choose this for any physical activity — gym, home workouts, sports, or yoga.",
    },
    {
      id: "running", label: "Running", icon: Flame, emoji: "🏃",
      desc: "Running, jogging, walking",
      suggestions: ["Morning run", "Evening jog", "Walking 10k steps", "Couch to 5K"],
      tip: "Choose this if your goal is running, jogging, or even daily walks.",
    },
    {
      id: "coding", label: "Coding", icon: Code2, emoji: "💻",
      desc: "LeetCode, Codeforces, GitHub",
      suggestions: ["Solve 1 LeetCode daily", "Codeforces practice", "Build a side project", "Contribute to open source"],
      tip: "Auto-verifies via Codeforces, LeetCode, or GitHub if you connect your handle.",
    },
    {
      id: "study", label: "Study", icon: BookOpen, emoji: "📚",
      desc: "Books, courses, exam prep",
      suggestions: ["Read 30 pages", "Complete 1 course module", "Exam prep 2 hours", "Learn a new skill"],
      tip: "Perfect for students, exam prep, or learning anything new.",
    },
    {
      id: "no_doomscroll", label: "No Doom Scrolling", icon: Target, emoji: "📵",
      desc: "Limit Instagram, Twitter, YouTube",
      suggestions: ["Max 30 min social media", "Max 1 hour YouTube", "No Instagram after 9 PM", "No Twitter at all"],
      tip: "Upload your daily screen time screenshot showing app usage under your limit.",
    },
    {
      id: "custom", label: "Custom", icon: Target, emoji: "🎯",
      desc: "Define your own habit",
      suggestions: ["Meditate 10 min", "No social media", "Cold shower", "Journal daily", "No junk food"],
      tip: "Create any habit you want. You'll verify with a video or photo proof.",
    },
  ];

  // Verification methods per habit type
  function getMethodsForHabit(type: string): VerificationMethod[] {
    const video: VerificationMethod = { method: "video", label: "Video + Keyword", description: "Record a short video saying the keyword while doing your activity", requiresConfig: false };
    const photo: VerificationMethod = { method: "photo", label: "Photo Proof", description: "Take a photo showing your completed activity with the keyword written on paper", requiresConfig: false };

    switch (type) {
      case "fitness":
        return [
          { method: "strava", label: "Strava Auto-Verify", description: "Auto-verify workouts via Strava", requiresConfig: false },
          { method: "gps", label: "Gym GPS Check-in", description: "Verify location at your gym", requiresConfig: true, configFields: [{ key: "gym_name", label: "Gym Name", placeholder: "e.g. Gold's Gym" }] },
          video, photo,
        ];
      case "running":
        return [
          { method: "strava", label: "Strava Auto-Verify", description: "Auto-verify runs via Strava", requiresConfig: false },
          { method: "gps", label: "GPS Track", description: "Verify your running location", requiresConfig: false },
          video, photo,
        ];
      case "coding":
        return [
          { method: "codeforces", label: "Codeforces", description: "Auto-verify daily CF submissions", requiresConfig: true, configFields: [{ key: "handle", label: "CF Handle", placeholder: "e.g. tourist" }] },
          { method: "leetcode", label: "LeetCode", description: "Auto-verify daily LC submissions", requiresConfig: true, configFields: [{ key: "username", label: "LC Username", placeholder: "e.g. neetcode" }] },
          { method: "github", label: "GitHub Commits", description: "Auto-verify daily commits", requiresConfig: true, configFields: [{ key: "username", label: "GitHub Username", placeholder: "e.g. torvalds" }] },
          video, photo,
        ];
      case "no_doomscroll":
        return [
          { method: "screentime_screenshot", label: "Screen Time Screenshot", description: "Upload your daily screen time screenshot showing app usage", requiresConfig: true, configFields: [{ key: "max_hours", label: "Max Hours/Day", placeholder: "e.g. 1" }] },
          video, photo,
        ];
      default:
        return [video, photo];
    }
  }

  function toggleMethod(method: string) {
    setSelectedMethods(prev => {
      const exists = prev.find(m => m.method === method);
      if (exists) return prev.filter(m => m.method !== method);
      return [...prev, { method, config: {} }];
    });
  }

  function updateMethodConfig(method: string, key: string, value: string) {
    setSelectedMethods(prev => prev.map(m =>
      m.method === method ? { ...m, config: { ...m.config, [key]: value } } : m
    ));
  }

  async function createStake() {
    setLoading(true);
    setError("");

    // Build verification config from selected methods
    const verificationConfig: Record<string, string> = {};
    for (const m of selectedMethods) {
      if (m.method === "codeforces" && m.config.handle) verificationConfig.codeforces_handle = m.config.handle;
      if (m.method === "leetcode" && m.config.username) verificationConfig.leetcode_username = m.config.username;
      if (m.method === "github" && m.config.username) verificationConfig.github_username = m.config.username;
      if (m.method === "screentime_check" && m.config.max_hours) verificationConfig.max_hours = m.config.max_hours;
      if (m.method === "timed_selfie" && m.config.wake_time) verificationConfig.wake_time = m.config.wake_time;
    }

    try {
      const res = await fetch("/api/stakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          active_days: form.active_days.join(","),
          verification_config: verificationConfig,
          verification_methods: selectedMethods,
        }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStakeId(data.stake.id);
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPayment() {
    const file = screenshotRef.current?.files?.[0];
    if (!file) { setError("Upload payment screenshot"); return; }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("stake_id", (stakeId || payStakeId)!.toString());
    formData.append("amount", (form.total_amount || payAmount)!.toString());
    formData.append("type", "deposit");
    formData.append("screenshot", file);

    try {
      const res = await fetch("/api/payments", { method: "POST", body: formData });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPaymentDone(true);
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function captureLocation() {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      );
      setForm(f => ({ ...f, gym_lat: pos.coords.latitude, gym_lng: pos.coords.longitude }));
    } catch {
      setError("Could not get location. Please enable GPS.");
    }
  }

  const availableMethods = getMethodsForHabit(form.habit_type);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <nav className="sticky top-0 z-50 bg-[#faf9f7]/80 backdrop-blur-xl border-b border-stone-200/50">
        <div className="max-w-lg mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-stone-100 text-stone-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-stone-900">New Stake</span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s ? "bg-orange-500 text-white" :
                step === s ? "bg-stone-900 text-white" :
                "bg-stone-100 text-stone-400"
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={`w-8 h-0.5 rounded ${step > s ? "bg-orange-400" : "bg-stone-200"}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold">{error}</div>
        )}

        {/* Step 1: Pick habit & configure */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-6">Pick your habit</h2>
              <div className="grid grid-cols-2 gap-3">
                {habitTypes.map(h => (
                  <button key={h.id} onClick={() => { setForm(f => ({ ...f, habit_type: h.id, habit_description: "" })); setSelectedMethods([]); }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      form.habit_type === h.id
                        ? "border-stone-900 bg-stone-50 shadow-sm"
                        : "border-stone-200 hover:border-stone-300"
                    }`}>
                    <span className="text-2xl mb-1 block">{h.emoji}</span>
                    <p className="font-bold text-stone-900 text-sm">{h.label}</p>
                    <p className="text-[11px] text-stone-400">{h.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Smart suggestions for selected type */}
            {(() => {
              const selected = habitTypes.find(h => h.id === form.habit_type);
              if (!selected) return null;
              return (
                <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Suggestions</p>
                  <p className="text-sm text-stone-600 mb-3">{selected.tip}</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.suggestions.map(s => (
                      <button key={s} onClick={() => setForm(f => ({ ...f, habit_description: s }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          form.habit_description === s
                            ? "bg-stone-900 text-white"
                            : "bg-white text-stone-600 border border-stone-200 hover:border-stone-400"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {form.habit_description && (
                    <p className="mt-3 text-sm font-semibold text-stone-700">Selected: {form.habit_description}</p>
                  )}
                </div>
              );
            })()}

            {/* Custom text input */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                {form.habit_type === "custom" ? "Describe your habit" : "Or type your own"}
              </label>
              <input type="text" value={form.habit_description}
                onChange={e => setForm(f => ({ ...f, habit_description: e.target.value }))}
                className="w-full px-5 py-4 rounded-2xl border-2 border-stone-200 bg-white text-stone-900 font-medium focus:border-orange-400 outline-none transition-colors"
                placeholder="e.g., Run 5km every morning" />
            </div>

            {(form.habit_type === "fitness" || form.habit_type === "running") && (
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Gym location (optional)</label>
                <input type="text" value={form.gym_name} placeholder="Gym name"
                  onChange={e => setForm(f => ({ ...f, gym_name: e.target.value }))}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-stone-200 bg-white text-stone-900 font-medium focus:border-orange-400 outline-none transition-colors mb-3" />
                <button onClick={captureLocation}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-semibold hover:bg-stone-50 transition-all">
                  <MapPin className="w-4 h-4" /> Capture GPS
                </button>
                {form.gym_lat !== 0 && (
                  <p className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Location captured</p>
                )}
              </div>
            )}

            {/* Amount + Duration */}
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-6">Set your stake</h2>
              <div className="bg-white rounded-2xl border border-stone-200 p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-stone-500">Amount</span>
                    <span className="text-2xl font-black text-stone-900">{formatCurrency(form.total_amount)}</span>
                  </div>
                  <input type="range" min={100} max={25000} step={100} value={form.total_amount}
                    onChange={e => setForm(f => ({ ...f, total_amount: parseInt(e.target.value) }))}
                    className="w-full accent-orange-500 h-2" />
                  <div className="flex justify-between text-xs text-stone-400 font-medium mt-1">
                    <span>₹100</span><span>₹25,000</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-stone-500">Duration</span>
                    <span className="text-2xl font-black text-stone-900">{form.duration_days} days</span>
                  </div>
                  <input type="range" min={7} max={42} step={7} value={form.duration_days}
                    onChange={e => setForm(f => ({ ...f, duration_days: parseInt(e.target.value) }))}
                    className="w-full accent-orange-500 h-2" />
                  <div className="flex justify-between text-xs text-stone-400 font-medium mt-1">
                    <span>7 days</span><span>42 days</span>
                  </div>
                </div>
              </div>

              {/* Days per week schedule */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-stone-500">Schedule</span>
                  <span className="text-sm font-black text-stone-900">
                    {form.days_per_week === 7 ? "Every day" : `${form.days_per_week} days/week`}
                  </span>
                </div>

                <div className="flex gap-2 mb-3">
                  {[3, 4, 5, 6, 7].map(n => (
                    <button key={n} onClick={() => setDaysPerWeek(n)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        form.days_per_week === n
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                      }`}>
                      {n === 7 ? "Daily" : `${n}x`}
                    </button>
                  ))}
                </div>

                {form.days_per_week < 7 && (
                  <div className="flex gap-1.5">
                    {DAY_LABELS.map((label, idx) => (
                      <button key={idx} onClick={() => toggleActiveDay(idx)}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${
                          form.active_days.includes(idx)
                            ? "bg-orange-500 text-white"
                            : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 bg-orange-50 rounded-2xl p-5 border border-orange-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-stone-600">Miss a day, you lose</span>
                  <span className="text-xl font-black text-red-500">{formatCurrency(Math.ceil(form.total_amount / getProofDaysCount()))}</span>
                </div>
                {form.days_per_week < 7 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-stone-400">Total proof days</span>
                    <span className="text-xs font-bold text-stone-600">{getProofDaysCount()} days over {form.duration_days} day period</span>
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => setStep(2)}
              className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-base transition-all hover:shadow-lg">
              Next: Choose Verification
            </button>
          </div>
        )}

        {/* Step 2: Verification methods */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">How will you prove it?</h2>
              <p className="text-stone-400 text-sm mb-6">Select at least one verification method. Auto-verify methods approve instantly.</p>

              <div className="space-y-3">
                {availableMethods.map(m => {
                  const isSelected = selectedMethods.some(sm => sm.method === m.method);
                  const isAuto = m.method !== "photo";
                  return (
                    <div key={m.method} className={`rounded-2xl border-2 transition-all ${
                      isSelected ? "border-stone-900 bg-stone-50" : "border-stone-200"
                    }`}>
                      <button onClick={() => toggleMethod(m.method)}
                        className="w-full p-4 text-left flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
                          isSelected ? "bg-stone-900 border-stone-900" : "border-stone-300"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-stone-900 text-sm">{m.label}</p>
                            {isAuto && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">Auto</span>
                            )}
                          </div>
                          <p className="text-xs text-stone-400 mt-0.5">{m.description}</p>
                        </div>
                      </button>

                      {/* Config fields */}
                      {isSelected && m.requiresConfig && m.configFields && (
                        <div className="px-4 pb-4 space-y-2">
                          {m.configFields.map(field => (
                            <input
                              key={field.key}
                              type={field.key === "wake_time" ? "time" : "text"}
                              placeholder={field.placeholder}
                              value={selectedMethods.find(sm => sm.method === m.method)?.config[field.key] || ""}
                              onChange={e => updateMethodConfig(m.method, field.key, e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 font-medium text-sm focus:border-orange-400 outline-none transition-colors"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500 font-medium">Stake amount</span>
                <span className="font-bold text-stone-900">{formatCurrency(form.total_amount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500 font-medium">Platform fee</span>
                <span className="font-bold text-stone-900">{formatCurrency(getPlatformFee(form.total_amount))}</span>
              </div>
              <div className="border-t border-stone-100 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-stone-700">Total to pay</span>
                <span className="text-lg font-black text-stone-900">{formatCurrency(form.total_amount + getPlatformFee(form.total_amount))}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-6 py-4 border-2 border-stone-200 rounded-2xl text-stone-500 font-semibold hover:bg-stone-50 transition-all">
                Back
              </button>
              <button onClick={createStake} disabled={loading || selectedMethods.length === 0}
                className="flex-1 py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-base transition-all disabled:opacity-50 hover:shadow-lg">
                {loading ? "Creating..." : `Lock ${formatCurrency(form.total_amount + getPlatformFee(form.total_amount))}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold text-stone-900 mb-2">Pay via UPI</h2>
              <p className="text-stone-400">Scan QR or send to UPI ID below</p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
              <p className="text-4xl font-black text-stone-900 mb-2">
                {formatCurrency(parseInt(payAmount || form.total_amount.toString()) + getPlatformFee(parseInt(payAmount || form.total_amount.toString())))}
              </p>
              <p className="text-xs text-stone-400 mb-6">
                {formatCurrency(parseInt(payAmount || form.total_amount.toString()))} stake + {formatCurrency(getPlatformFee(parseInt(payAmount || form.total_amount.toString())))} platform fee
              </p>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-3 rounded-2xl border-2 border-stone-100 shadow-sm">
                  <img src="/upi-qr.png" alt="UPI QR Code" className="w-48 h-48 object-contain rounded-lg" />
                </div>
              </div>

              <p className="text-sm text-stone-400 mb-1">Or send to UPI ID</p>
              <p className="text-lg font-mono font-bold text-orange-500 select-all bg-orange-50 inline-block px-4 py-2 rounded-xl">subhangladha@oksbi</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                <Upload className="w-4 h-4 inline mr-1" /> Payment Screenshot
              </label>
              <input ref={screenshotRef} type="file" accept="image/*"
                className="w-full text-sm text-stone-500 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:bg-stone-900 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-stone-800" />
            </div>

            {/* Disclaimer */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
              <p className="text-xs text-stone-500 leading-relaxed">
                <span className="font-bold text-stone-700">Your money is safe.</span> Your stake is held securely and only burned if you fail to submit verified proof. Payment gateway integration coming soon.
                For any queries, reach out to{" "}
                <a href="mailto:motiv2812@gmail.com" className="text-orange-500 font-semibold underline">motiv2812@gmail.com</a>
              </p>
            </div>

            <button onClick={submitPayment} disabled={loading}
              className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-base transition-all disabled:opacity-50 hover:shadow-lg">
              {loading ? "Uploading..." : "I've Paid"}
            </button>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="text-center py-8">
            <span className="text-6xl mb-6 block">🔥</span>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">You&apos;re in.</h2>
            <p className="text-stone-400 mb-10 max-w-xs mx-auto">
              Payment is being verified. Once approved, your countdown begins.
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-10 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all">
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewStakePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <div className="text-5xl font-script text-orange-500 animate-pulse-soft transform -rotate-2">Motiv</div>
      </div>
    }>
      <NewStakeContent />
    </Suspense>
  );
}
