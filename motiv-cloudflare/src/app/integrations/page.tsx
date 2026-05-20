"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, ExternalLink, Check, X, Loader2, Zap, Heart, Watch } from "lucide-react";

interface Integration {
  id: number;
  provider: string;
  provider_user_id: string;
  created_at: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    // Check URL params for status messages
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "strava") {
      setToast({ type: "success", message: "Strava connected successfully" });
      window.history.replaceState({}, "", "/integrations");
    }
    if (params.get("error")) {
      const errorMessages: Record<string, string> = {
        denied: "Authorization was denied",
        token_failed: "Failed to get access token",
        unknown: "Something went wrong",
      };
      setToast({ type: "error", message: errorMessages[params.get("error")!] || "Connection failed" });
      window.history.replaceState({}, "", "/integrations");
    }

    fetchIntegrations();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchIntegrations() {
    try {
      const res = await fetch("/api/integrations");
      const data: any = await res.json();
      setIntegrations(data.integrations || []);
    } finally {
      setLoading(false);
    }
  }

  async function connectStrava() {
    setConnecting("strava");
    try {
      const res = await fetch("/api/integrations/strava?action=connect");
      const data: any = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setToast({ type: "error", message: data.error || "Failed to start connection" });
        setConnecting(null);
      }
    } catch {
      setToast({ type: "error", message: "Network error" });
      setConnecting(null);
    }
  }

  async function disconnectStrava() {
    if (!confirm("Disconnect Strava? Auto-verification for fitness stakes will stop.")) return;
    setDisconnecting("strava");
    try {
      await fetch("/api/integrations/strava", { method: "DELETE" });
      setIntegrations(prev => prev.filter(i => i.provider !== "strava"));
      setToast({ type: "success", message: "Strava disconnected" });
    } catch {
      setToast({ type: "error", message: "Failed to disconnect" });
    } finally {
      setDisconnecting(null);
    }
  }

  const isConnected = (provider: string) => integrations.some(i => i.provider === provider);
  const getIntegration = (provider: string) => integrations.find(i => i.provider === provider);

  const services = [
    {
      id: "strava",
      name: "Strava",
      description: "Auto-verify gym, running, and cycling stakes with your Strava activities",
      color: "#FC4C02",
      icon: Activity,
      available: true,
      onConnect: connectStrava,
      onDisconnect: disconnectStrava,
    },
    {
      id: "apple_health",
      name: "Apple Health",
      description: "Sync step counts, workouts, and sleep data for automatic proof",
      color: "#FF2D55",
      icon: Heart,
      available: false,
    },
    {
      id: "google_fit",
      name: "Google Fit",
      description: "Connect your fitness data for seamless activity verification",
      color: "#4285F4",
      icon: Watch,
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl flex items-center gap-3 animate-slide-up ${
          toast.type === "success"
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="border-b border-stone-800/80">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-stone-800 text-stone-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="font-bold tracking-tight">Integrations</span>
            </div>
          </div>
          <span className="text-xl font-script text-orange-500 transform -rotate-2">Motiv</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Connected Services</h1>
          <p className="text-stone-500 text-sm font-medium">
            Link your fitness apps for automatic proof verification. Less effort, same accountability.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-stone-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => {
              const connected = isConnected(service.id);
              const integration = getIntegration(service.id);
              const isConnecting = connecting === service.id;
              const isDisconnecting = disconnecting === service.id;

              return (
                <div
                  key={service.id}
                  className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${
                    connected
                      ? "bg-stone-900 border-stone-700"
                      : service.available
                      ? "bg-stone-900 border-stone-800 hover:border-stone-700"
                      : "bg-stone-900/50 border-stone-800/50"
                  }`}
                >
                  {/* Subtle top accent line when connected */}
                  {connected && (
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: service.color }} />
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Service Info */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            connected ? "shadow-lg" : ""
                          }`}
                          style={{
                            background: service.available
                              ? `${service.color}18`
                              : "rgba(120,113,108,0.1)",
                          }}
                        >
                          <service.icon
                            className="w-5 h-5"
                            style={{
                              color: service.available ? service.color : "#78716c",
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 mb-1">
                            <h3 className={`font-bold ${service.available ? "text-white" : "text-stone-500"}`}>
                              {service.name}
                            </h3>
                            {connected && (
                              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                                </span>
                                Connected
                              </span>
                            )}
                            {!service.available && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-500 uppercase tracking-wider">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <p className={`text-sm leading-relaxed ${service.available ? "text-stone-400" : "text-stone-600"}`}>
                            {service.description}
                          </p>
                          {connected && integration && (
                            <p className="text-[11px] text-stone-600 mt-2 font-medium">
                              ID: {integration.provider_user_id} &middot; Connected {new Date(integration.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0">
                        {service.available && !connected && (
                          <button
                            onClick={service.onConnect}
                            disabled={isConnecting}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                            style={{
                              background: `${service.color}20`,
                              color: service.color,
                            }}
                          >
                            {isConnecting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ExternalLink className="w-3.5 h-3.5" />
                            )}
                            {isConnecting ? "Connecting" : "Connect"}
                          </button>
                        )}
                        {service.available && connected && (
                          <button
                            onClick={service.onDisconnect}
                            disabled={isDisconnecting}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 text-stone-400 text-sm font-bold hover:bg-red-500/20 hover:text-red-400 transition-all disabled:opacity-50"
                          >
                            {isDisconnecting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                            {isDisconnecting ? "..." : "Disconnect"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info footer */}
        <div className="mt-10 p-5 rounded-2xl border border-stone-800/50 bg-stone-900/30">
          <p className="text-xs text-stone-500 leading-relaxed font-medium">
            Connected services allow Motiv to automatically verify your daily proofs. When you complete a workout on Strava,
            your gym or running stake gets auto-verified — no photo needed. Your data stays private and is only used for verification.
          </p>
        </div>
      </div>
    </div>
  );
}
