"use client";

class SoundManager {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.15) {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  coin() {
    this.playTone(1200, 0.1, "square", 0.08);
    setTimeout(() => this.playTone(1600, 0.15, "square", 0.08), 80);
  }

  whoosh() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.05, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  success() {
    this.playTone(523, 0.15, "sine", 0.1);
    setTimeout(() => this.playTone(659, 0.15, "sine", 0.1), 100);
    setTimeout(() => this.playTone(784, 0.2, "sine", 0.12), 200);
    setTimeout(() => this.playTone(1047, 0.3, "sine", 0.1), 300);
  }

  achievement() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 0.2, "sine", 0.1), i * 100);
    });
  }

  burn() {
    this.playTone(150, 0.5, "sawtooth", 0.08);
    setTimeout(() => this.playTone(100, 0.8, "sawtooth", 0.06), 200);
  }

  click() {
    this.playTone(800, 0.05, "square", 0.05);
  }
}

export const sounds = new SoundManager();
