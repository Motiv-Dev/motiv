"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function ExtensionAuthPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) return;

    // Fetch the extension token
    fetch("/api/auth/extension-token")
      .then((res) => res.json())
      .then((data: any) => {
        if (data.error) {
          setStatus("error");
          return;
        }

        setEmail(data.email);

        // Pass token back to extension via URL hash
        // The extension content script or popup will read this
        const params = new URLSearchParams({
          token: data.token,
          user_id: String(data.user_id),
          email: data.email,
        });

        // Try to send message to extension via postMessage
        window.postMessage(
          {
            type: "MOTIV_EXTENSION_AUTH",
            token: data.token,
            user_id: data.user_id,
            email: data.email,
          },
          "*"
        );

        // Also put in URL hash for the extension to read
        window.location.hash = params.toString();
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-script text-orange-500 transform -rotate-2 mb-4">Motiv</p>
          <p className="text-stone-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-3xl font-script text-orange-500 transform -rotate-2 mb-6">Motiv</p>
          <h1 className="text-xl font-bold text-stone-900 mb-3">Sign in to connect extension</h1>
          <p className="text-stone-400 text-sm mb-6">
            You need to be logged in to your Motiv account to connect the browser extension.
          </p>
          <Link
            href="/sign-in?redirect_url=/extension-auth"
            className="inline-block px-8 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
      <div className="text-center max-w-sm">
        <p className="text-3xl font-script text-orange-500 transform -rotate-2 mb-6">Motiv</p>

        {status === "loading" && (
          <>
            <h1 className="text-xl font-bold text-stone-900 mb-3">Connecting extension...</h1>
            <p className="text-stone-400 text-sm">Please wait</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-stone-900 mb-2">Extension Connected!</h1>
            <p className="text-stone-400 text-sm mb-1">Logged in as <strong className="text-stone-600">{email}</strong></p>
            <p className="text-stone-400 text-sm mb-6">
              Go back to the extension popup — it should show you're connected.
            </p>
            <p className="text-xs text-stone-300">You can close this tab.</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-red-600 mb-3">Connection Failed</h1>
            <p className="text-stone-400 text-sm mb-6">Something went wrong. Try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
            >
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  );
}
