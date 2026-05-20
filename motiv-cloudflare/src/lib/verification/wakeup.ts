import type { VerifyResult, VerifyContext } from "./index";

export async function verifyWakeup(method: string, config: any, ctx: VerifyContext): Promise<VerifyResult> {
  if (method !== "timed_selfie") {
    return { passed: false, method, score: 0, details: "Unknown wake-up verification method" };
  }

  const wakeTime = config.wake_time; // e.g. "06:00"
  if (!wakeTime) {
    return { passed: false, method: "timed_selfie", score: 0, details: "No wake-up time configured" };
  }

  // Check if proof was submitted before the deadline
  const now = new Date();
  const [hours, minutes] = wakeTime.split(":").map(Number);
  const deadline = new Date();
  deadline.setHours(hours, minutes, 0, 0);

  if (now <= deadline) {
    return {
      passed: true,
      method: "timed_selfie",
      score: 100,
      details: `Proof submitted at ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} — before ${wakeTime} deadline`,
    };
  }

  // Calculate how late
  const lateMinutes = Math.round((now.getTime() - deadline.getTime()) / (1000 * 60));
  return {
    passed: false,
    method: "timed_selfie",
    score: Math.max(0, 80 - lateMinutes * 2), // Lose 2 points per minute late
    details: `Proof submitted ${lateMinutes} minutes late (deadline: ${wakeTime})`,
  };
}
