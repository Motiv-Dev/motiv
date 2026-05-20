"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ArrowRight, Star } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function FAQ({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-6 cursor-pointer text-left hover:bg-stone-50 transition-colors"
      >
        <span className="text-lg font-semibold text-stone-800 pr-8">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-6 text-base text-stone-500 leading-relaxed border-t border-stone-100 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const protocolRef = useRef<HTMLElement>(null);
  const darkRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animations
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .fromTo(".hero-badge", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.2 })
        .fromTo(".hero-title", { y: 40, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.8 }, "-=0.3")
        .fromTo(".hero-subtitle", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.4")
        .fromTo(".hero-heading", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
        .fromTo(".hero-cta", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, "-=0.3")
        .fromTo(".hero-note", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "-=0.2");

      // Hero SVG path draw
      gsap.fromTo(".hero-path",
        { strokeDashoffset: 2000 },
        { strokeDashoffset: 0, duration: 2, delay: 0.5, ease: "power2.inOut" },
      );

      // Protocol section - scroll triggered
      gsap.fromTo(".protocol-title",
        { y: 50, opacity: 0 },
        { scrollTrigger: { trigger: ".protocol-title", start: "top 85%", toggleActions: "play none none none" },
          y: 0, opacity: 1, duration: 0.7 },
      );

      gsap.fromTo(".protocol-card",
        { y: 60, opacity: 0 },
        { scrollTrigger: { trigger: ".protocol-card", start: "top 85%", toggleActions: "play none none none" },
          y: 0, opacity: 1, duration: 0.6, stagger: 0.15 },
      );

      // Dark section - timeline items slide in from left
      gsap.fromTo(".dark-title",
        { x: -60, opacity: 0 },
        { scrollTrigger: { trigger: ".dark-title", start: "top 80%", toggleActions: "play none none none" },
          x: 0, opacity: 1, duration: 0.7 },
      );

      gsap.fromTo(".timeline-item",
        { x: -40, opacity: 0 },
        { scrollTrigger: { trigger: ".timeline-item", start: "top 85%", toggleActions: "play none none none" },
          x: 0, opacity: 1, duration: 0.5, stagger: 0.12 },
      );

      // Features - stagger up
      gsap.fromTo(".feature-card",
        { y: 50, opacity: 0 },
        { scrollTrigger: { trigger: ".feature-card", start: "top 85%", toggleActions: "play none none none" },
          y: 0, opacity: 1, duration: 0.5, stagger: 0.12 },
      );

      // Testimonials - scale in
      gsap.fromTo(".testimonial-card",
        { y: 40, opacity: 0, scale: 0.95 },
        { scrollTrigger: { trigger: ".testimonial-card", start: "top 85%", toggleActions: "play none none none" },
          y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 },
      );

      // FAQ - slide up
      gsap.fromTo(".faq-item",
        { y: 30, opacity: 0 },
        { scrollTrigger: { trigger: ".faq-item", start: "top 90%", toggleActions: "play none none none" },
          y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
      );

      // CTA - scale in with glow
      gsap.fromTo(".cta-block",
        { y: 60, opacity: 0, scale: 0.95 },
        { scrollTrigger: { trigger: ".cta-block", start: "top 80%", toggleActions: "play none none none" },
          y: 0, opacity: 1, scale: 1, duration: 0.8 },
      );

      // Parallax on hero background
      gsap.to(".hero-bg-path", {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: 100,
        opacity: 0,
      });

      // Section headings text fill on scroll
      document.querySelectorAll(".scroll-fill").forEach((el) => {
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "top 40%",
            scrub: 1,
          },
          backgroundSize: "100% 100%",
        });
      });

    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#fcfaf8]/90 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-script text-orange-600 pt-1 tracking-wide">
            Motiv
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors">
              Login
            </Link>
            <Link href="/sign-up" className="text-sm font-semibold bg-stone-800 text-stone-50 px-5 py-2.5 rounded-full hover:bg-stone-700 transition-colors shadow-sm ring-1 ring-stone-900/5">
              Join the Protocol
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header ref={heroRef} className="pt-32 pb-24 md:pt-44 md:pb-32 px-6 relative overflow-hidden bg-grid">
        <svg className="hero-bg-path absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-visible" preserveAspectRatio="none">
          <path className="hero-path" d="M-100,200 C100,200 200,50 400,150 C600,250 800,100 1200,180" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="8 4" style={{ strokeDasharray: 2000, strokeDashoffset: 0 }} />
        </svg>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-orange-100 text-orange-700 text-xs font-semibold shadow-sm shadow-orange-100/50 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            V1 Live: Skin in the game
          </div>

          <div className="hero-title mb-8">
            <h1 className="text-8xl md:text-9xl font-script text-orange-500 leading-[0.8] drop-shadow-sm transform -rotate-2">
              Motiv
            </h1>
          </div>

          <p className="hero-subtitle text-xs md:text-sm font-bold tracking-widest text-orange-700 uppercase mb-8">
            Your excuses just got expensive
          </p>

          <h2 className="hero-heading text-4xl md:text-6xl font-bold text-stone-900 tracking-tight mb-12 text-balance">
            Execute or Forfeit.
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up" className="hero-cta group w-full sm:w-auto px-8 py-3.5 bg-stone-800 text-stone-50 text-base font-semibold rounded-xl hover:bg-stone-700 transition-all shadow-xl shadow-stone-200/50 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2">
              Pledge Your Stake
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#protocol" className="hero-cta w-full sm:w-auto px-8 py-3.5 bg-white text-stone-600 border border-stone-200 text-base font-semibold rounded-xl hover:bg-stone-50 transition-all hover:-translate-y-0.5">
              See How it Works
            </a>
          </div>

          <p className="hero-note mt-8 text-xs text-stone-400 font-medium">
            For founders, students, and athletes who need real accountability.
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-5 h-5 text-stone-300" />
        </div>
      </header>

      {/* 3-Step Protocol */}
      <section ref={protocolRef} id="protocol" className="py-28 px-6 max-w-5xl mx-auto relative">
        <div className="protocol-title text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight mb-5">
            The Hard-Line Protocol
          </h2>
          <p className="text-stone-500 text-lg font-medium">
            Three steps. Zero loopholes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 relative">
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-6 z-0 pointer-events-none">
            <svg width="100%" height="100%" preserveAspectRatio="none">
              <path d="M0,10 C100,25 200,-5 300,10 S500,25 800,10" fill="none" stroke="#fdba74" strokeWidth="2" strokeDasharray="6 4" />
            </svg>
          </div>

          {[
            { num: 1, title: "Stake", desc: "Choose your habit. Lock real money. Risk makes it real." },
            { num: 2, title: "Execute", desc: "Beat the clock. Complete your daily task before the stake burns." },
            { num: 3, title: "Verify", desc: "Upload proof. A human personally verifies your submission. Pass = Payout." },
          ].map((step) => (
            <div key={step.num} className="protocol-card bg-white p-8 border border-stone-200 rounded-2xl shadow-sm hover:border-orange-300 transition-all duration-300 relative z-10 group">
              <div className="w-12 h-12 bg-white border-2 border-orange-100 group-hover:border-orange-500 group-hover:text-orange-600 rounded-full flex items-center justify-center text-xl font-script text-stone-400 mb-6 transition-colors shadow-sm">
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">{step.title}</h3>
              <p className="text-base text-stone-500 font-normal">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dark Section */}
      <section ref={darkRef} className="py-28 bg-[#2c2825] text-stone-300 relative overflow-hidden">
        <svg className="absolute right-0 top-0 h-full w-1/3 pointer-events-none opacity-5" viewBox="0 0 100 800" preserveAspectRatio="none">
          <path d="M50,0 Q100,200 0,400 T50,800" stroke="white" strokeWidth="2" fill="none" />
        </svg>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="dark-title mb-20 max-w-xl">
            <h2 className="text-4xl font-bold text-white tracking-tight mb-4">How the Protocol Works</h2>
            <p className="text-stone-400 text-lg font-medium">Every loophole removed. Every excuse eliminated.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-14">
            {[
              { step: "01", title: "Commit Capital", desc: "Pledge ₹100 - ₹25,000. Split into daily chunks of risk.", highlight: true },
              { step: "02", title: "Live Countdown", desc: "A real-time timer runs on your dashboard. Excuses burn money.", highlight: false },
              { step: "03", title: "Video Proof", desc: "Record a short video saying a unique keyword. Founder personally verifies every submission.", highlight: false },
              { step: "04", title: "Capital Refund", desc: "Complete your streak and reclaim your capital. Discipline achieved.", highlight: true },
            ].map((item) => (
              <div key={item.step} className={`timeline-item pl-8 relative border-l-2 ${item.highlight ? "border-orange-500/30" : "border-stone-700"}`}>
                <span className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#2c2825] border-2 ${item.highlight ? "border-orange-500" : "border-stone-600"}`} />
                <h4 className={`text-xl font-script mb-1 ${item.highlight ? "text-orange-400" : "text-stone-500"}`}>Step {item.step}</h4>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-base text-stone-400 font-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="py-28 max-w-5xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-16">
          Built to make cheating impossible.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Human-Verified Proofs", desc: "Every proof is personally reviewed by the founder. No AI shortcuts, no loopholes. Real eyes on real proof." },
            { title: "Video + GPS Lock", desc: "Record a video saying a unique keyword. Geolocation auto-captured. No way to fake it." },
            { title: "Wall of Shame", desc: "Watch real-time burns. Nothing motivates like collective consequence." },
          ].map((item) => (
            <div key={item.title} className="feature-card p-8 rounded-2xl border border-stone-200 bg-white hover:shadow-lg hover:shadow-orange-100/50 hover:border-orange-200 transition-all duration-300">
              <h3 className="font-bold text-stone-800 mb-3 text-lg">{item.title}</h3>
              <p className="text-base text-stone-500 font-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-28 max-w-5xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-stone-800 mb-4 tracking-tight">Pilot Results</h2>
        <p className="text-stone-400 text-sm font-medium mb-16">Real results from our first 5 pilot testers — friends & family who put real money on the line.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { quote: "Staked ₹1000 on hitting the gym 5 days a week. Missed 2 days in 30 — lost ₹66 but built a real habit. Worth every rupee.", name: "Pilot User #1", role: "Gym 5/7 days", initial: "G" },
            { quote: "100 pushups every single day for 21 days. Sent video proof daily. The stake made it non-negotiable.", name: "Pilot User #2", role: "100 Pushups Daily", initial: "P" },
            { quote: "Quit doomscrolling for 14 days straight. Knowing I'd lose money if I opened Instagram after 9pm actually worked.", name: "Pilot User #3", role: "No Doomscrolling", initial: "D" },
          ].map((t) => (
            <div key={t.name} className="testimonial-card p-8 rounded-3xl bg-white border border-stone-100 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <div className="flex gap-1 text-orange-400 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-base text-stone-600 leading-relaxed font-normal mb-8">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-4 border-t border-stone-50 pt-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800">{t.name}</p>
                  <p className="text-xs text-stone-400 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-stone-800 mb-14 text-center tracking-tight">FAQ</h2>
        <div className="space-y-4">
          <div className="faq-item"><FAQ question="Who verifies my proof?" answer="Right now, the founder personally reviews every single proof. A unique expiring keyword ensures you can't reuse old footage. We're a small team and we check everything manually — that's what makes it trustworthy." /></div>
          <div className="faq-item"><FAQ question="Is my money safe?" answer="Your stake is held securely. Payments are currently via UPI transfer — a payment gateway is coming soon. You can request a full refund before your stake activates. After activation, the commitment is binding. For any concerns, email motiv2812@gmail.com." /></div>
          <div className="faq-item"><FAQ question="Can I get a refund if I quit?" answer="No. That's the entire point. Once your stake activates, it's locked. If you complete all your days, you get your full stake back. If you miss a day, that day's portion is forfeited. See our Terms of Service for full details." /></div>
          <div className="faq-item"><FAQ question="What habits can I stake on?" answer="Gym, running, pushups, coding, no doomscrolling, no smoking, waking up early, and any custom habit. You choose your schedule — daily or X days per week." /></div>
          <div className="faq-item"><FAQ question="How much does it cost?" answer="You choose your stake (₹100 - ₹25,000). There's a small platform fee (₹9 - ₹99 based on your stake) charged at payment. If you complete your challenge, you get your full stake back. The platform fee is non-refundable." /></div>
        </div>
      </section>

      {/* PWA Install Guide */}
      <section className="py-20 max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Install Motiv on your phone</h2>
          <p className="text-stone-400 text-sm mb-6">Use Motiv like a native app — no app store needed.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-stone-50 rounded-2xl p-5">
              <p className="font-bold text-stone-800 text-sm mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 8v8m-4-4h8"/></svg>
                iPhone / iPad
              </p>
              <ol className="text-sm text-stone-500 space-y-2 list-decimal list-inside">
                <li>Open <strong className="text-stone-700">motiv-app-five.vercel.app</strong> in Safari</li>
                <li>Tap the <strong className="text-stone-700">Share</strong> button (bottom bar)</li>
                <li>Scroll down and tap <strong className="text-stone-700">&quot;Add to Home Screen&quot;</strong></li>
                <li>Tap <strong className="text-stone-700">Add</strong> — done!</li>
              </ol>
            </div>
            <div className="bg-stone-50 rounded-2xl p-5">
              <p className="font-bold text-stone-800 text-sm mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M12 8v8m-4-4h8"/></svg>
                Android
              </p>
              <ol className="text-sm text-stone-500 space-y-2 list-decimal list-inside">
                <li>Open <strong className="text-stone-700">motiv-app-five.vercel.app</strong> in Chrome</li>
                <li>Tap the <strong className="text-stone-700">three dots</strong> menu (top right)</li>
                <li>Tap <strong className="text-stone-700">&quot;Add to Home Screen&quot;</strong></li>
                <li>Tap <strong className="text-stone-700">Install</strong> — done!</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="py-28 px-6">
        <div className="cta-block max-w-3xl mx-auto bg-[#2c2825] rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-orange-500 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity" />
          <h3 className="text-4xl md:text-5xl font-script text-orange-400 transform -rotate-2 drop-shadow-sm mb-6 relative z-10">
            Stop thinking.<br />Start staking.
          </h3>
          <p className="text-stone-400 font-medium mb-10 relative z-10">
            Every day you wait costs you confidence and momentum.
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-stone-900 font-bold rounded-xl hover:bg-orange-50 transition-all transform hover:scale-[1.01] shadow-2xl relative z-10">
            Pledge Your Stake <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-stone-200 relative overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full h-12 opacity-10" preserveAspectRatio="none">
          <path d="M0,10 Q500,60 1000,10" stroke="orange" fill="none" strokeWidth="2" />
        </svg>
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <span className="font-script text-lg text-orange-600">Motiv</span>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-xs text-stone-400 hover:text-stone-600 font-medium transition-colors">Terms of Service</Link>
            <a href="mailto:motiv2812@gmail.com" className="text-xs text-stone-400 hover:text-stone-600 font-medium transition-colors">Contact</a>
          </div>
          <p className="text-xs text-stone-400 font-medium">
            &copy; {new Date().getFullYear()} Motiv. Execute or Forfeit.
          </p>
        </div>
      </footer>
    </div>
  );
}
