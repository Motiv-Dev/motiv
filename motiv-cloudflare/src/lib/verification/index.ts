import { db } from "@/lib/db";
import { verifyCoding } from "./coding";
import { verifyFitness } from "./fitness";
import { verifyScreentime } from "./screentime";
import { verifyWakeup } from "./wakeup";

export interface VerifyResult {
  passed: boolean;
  method: string;
  score: number; // 0-100
  details: string;
}

export interface VerifyContext {
  stakeId: number;
  userId: number;
  habitType: string;
  dayNumber: number;
  proofId: number;
  verificationConfig: any;
  photoUrl?: string;
  gpsLat?: number;
  gpsLng?: number;
}

// Main verification router — runs all enabled methods for the stake's habit type
export async function runAutoVerification(ctx: VerifyContext): Promise<{
  autoApproved: boolean;
  results: VerifyResult[];
}> {
  // Get enabled verification methods for this stake
  const methods = await db.all(
    "SELECT * FROM verification_methods WHERE stake_id = ? AND enabled = 1",
    ctx.stakeId
  );

  const results: VerifyResult[] = [];

  for (const method of methods) {
    const config = method.config ? JSON.parse(method.config) : {};
    let result: VerifyResult | null = null;

    try {
      switch (method.method) {
        case "codeforces":
        case "leetcode":
        case "github":
          result = await verifyCoding(method.method, config, ctx);
          break;
        case "strava":
        case "gps":
          result = await verifyFitness(method.method, config, ctx);
          break;
        case "screentime_check":
          result = await verifyScreentime(method.method, config, ctx);
          break;
        case "timed_selfie":
          result = await verifyWakeup(method.method, config, ctx);
          break;
        default:
          break;
      }
    } catch (e: any) {
      result = { passed: false, method: method.method, score: 0, details: `Error: ${e.message}` };
    }

    if (result) results.push(result);
  }

  // Auto-approve if ANY auto-method passes with score >= 80
  const autoApproved = results.some(r => r.passed && r.score >= 80);

  // If auto-approved, update the proof status
  if (autoApproved) {
    await db.run(
      "UPDATE daily_proofs SET status = 'approved', verified_at = CURRENT_TIMESTAMP, admin_notes = ? WHERE id = ?",
      `Auto-verified: ${results.filter(r => r.passed).map(r => r.method).join(", ")}`,
      ctx.proofId
    );

    // Update stake stats
    await db.run(
      "UPDATE stakes SET total_completed = total_completed + 1, current_streak = current_streak + 1 WHERE id = ?",
      ctx.stakeId
    );
  }

  return { autoApproved, results };
}

// Get available verification methods for a habit type
export function getMethodsForHabit(habitType: string): { method: string; label: string; description: string; requiresConfig: boolean; configFields?: { key: string; label: string; placeholder: string }[] }[] {
  const common = [
    { method: "photo", label: "Photo + Keyword", description: "Take a photo with the daily keyword visible", requiresConfig: false },
  ];

  switch (habitType) {
    case "fitness":
      return [
        ...common,
        { method: "strava", label: "Strava Auto-Verify", description: "Connect Strava to auto-verify workouts", requiresConfig: false },
        { method: "gps", label: "Gym GPS Check-in", description: "Verify you're at your registered gym location", requiresConfig: true, configFields: [{ key: "gym_name", label: "Gym Name", placeholder: "e.g. Gold's Gym Andheri" }] },
      ];
    case "coding":
      return [
        { method: "codeforces", label: "Codeforces", description: "Auto-verify daily submissions on Codeforces", requiresConfig: true, configFields: [{ key: "handle", label: "Codeforces Handle", placeholder: "e.g. tourist" }] },
        { method: "leetcode", label: "LeetCode", description: "Auto-verify daily LeetCode submissions", requiresConfig: true, configFields: [{ key: "username", label: "LeetCode Username", placeholder: "e.g. neetcode" }] },
        { method: "github", label: "GitHub Commits", description: "Verify daily commits on GitHub", requiresConfig: true, configFields: [{ key: "username", label: "GitHub Username", placeholder: "e.g. torvalds" }] },
        ...common,
      ];
    case "screentime":
      return [
        { method: "screentime_check", label: "Screen Time Screenshot", description: "Upload your daily screen time screenshot for AI analysis", requiresConfig: true, configFields: [{ key: "max_hours", label: "Max Hours/Day", placeholder: "e.g. 3" }] },
        ...common,
      ];
    case "no_porn":
      return [
        { method: "extension", label: "Browser Extension", description: "Install our Chrome extension to auto-monitor browsing", requiresConfig: false },
        ...common,
      ];
    case "wake_up":
      return [
        { method: "timed_selfie", label: "Timed Selfie", description: "Take a selfie before your wake-up deadline", requiresConfig: true, configFields: [{ key: "wake_time", label: "Wake Up By", placeholder: "e.g. 06:00" }] },
        ...common,
      ];
    default:
      return common;
  }
}
