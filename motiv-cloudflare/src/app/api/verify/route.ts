import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeProofPhoto } from "@/lib/ai";

export const runtime = "edge";

interface VerificationResult {
  passed: boolean;
  score: number;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
    weight: number;
  }>;
  aiAnalysis?: {
    confidence: number;
    description: string;
    flags: string[];
  };
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { proof_id } = await req.json() as any;
    if (!proof_id) return NextResponse.json({ error: "Proof ID required" }, { status: 400 });

    const proof = await db.get(
      `SELECT dp.*, s.gym_lat as stake_gym_lat, s.gym_lng as stake_gym_lng, s.habit_type,
             s.daily_amount, s.gym_name
      FROM daily_proofs dp
      JOIN stakes s ON dp.stake_id = s.id
      WHERE dp.id = ?`,
      proof_id
    ) as any;

    if (!proof) return NextResponse.json({ error: "Proof not found" }, { status: 404 });

    const checks: VerificationResult["checks"] = [];

    // 1. Keyword check (weight: 20%)
    const keywordValid = !!proof.keyword && proof.keyword.length === 6;
    checks.push({
      name: "Keyword Present",
      passed: keywordValid,
      detail: keywordValid ? `Keyword: ${proof.keyword}` : "No keyword found",
      weight: 20,
    });

    // 2. Keyword expiry check (weight: 15%)
    const keywordFresh = proof.keyword_expires_at && new Date(proof.keyword_expires_at) >= new Date(proof.submitted_at);
    checks.push({
      name: "Keyword Timing",
      passed: !!keywordFresh,
      detail: keywordFresh ? "Submitted within keyword window" : "Keyword may have expired before submission",
      weight: 15,
    });

    // 3. GPS check (weight: 15%)
    if (proof.habit_type === "gym" && proof.stake_gym_lat && proof.stake_gym_lng) {
      if (proof.gps_lat && proof.gps_lng) {
        const distance = haversineDistance(proof.gps_lat, proof.gps_lng, proof.stake_gym_lat, proof.stake_gym_lng);
        const gpsOk = distance < 200;
        checks.push({
          name: "GPS Location",
          passed: gpsOk,
          detail: `${Math.round(distance)}m from ${proof.gym_name || "registered gym"} (threshold: 200m)`,
          weight: 15,
        });
      } else {
        checks.push({
          name: "GPS Location",
          passed: false,
          detail: "No GPS data submitted",
          weight: 15,
        });
      }
    }

    // 4. Photo check (weight: 10%)
    const hasPhoto = !!proof.photo_url;
    checks.push({
      name: "Photo Proof",
      passed: hasPhoto,
      detail: hasPhoto ? "Photo uploaded" : "No photo attached",
      weight: 10,
    });

    // 5. Screentime check (weight: 10%)
    if (proof.habit_type === "study") {
      const hasScreentime = !!proof.screentime_url;
      checks.push({
        name: "Screen Time",
        passed: hasScreentime,
        detail: hasScreentime ? "Screentime screenshot uploaded" : "No screentime proof",
        weight: 10,
      });
    }

    // 6. Submission time check (weight: 10%)
    const submittedHour = proof.submitted_at ? new Date(proof.submitted_at).getHours() : -1;
    const reasonableTime = submittedHour >= 4 && submittedHour <= 23;
    checks.push({
      name: "Submission Time",
      passed: reasonableTime,
      detail: submittedHour >= 0 ? `Submitted at ${submittedHour}:00 hours` : "No submission time recorded",
      weight: 10,
    });

    // 7. Duplicate photo check (weight: 10%)
    if (proof.photo_hash) {
      const duplicate = await db.get(
        `SELECT id, day_number FROM daily_proofs
        WHERE photo_hash = ? AND id != ? AND user_id = (SELECT user_id FROM daily_proofs WHERE id = ?)`,
        proof.photo_hash, proof_id, proof_id
      ) as any;

      checks.push({
        name: "Photo Uniqueness",
        passed: !duplicate,
        detail: duplicate
          ? `Duplicate of proof from day ${duplicate.day_number}`
          : "Photo is unique",
        weight: 10,
      });
    }

    // 8. AI Vision check (weight: 20%)
    let aiAnalysis = undefined;
    if (hasPhoto && proof.photo_url) {
      const aiResult = await analyzeProofPhoto(proof.photo_url, proof.habit_type, proof.keyword);

      if (aiResult.confidence >= 0) {
        aiAnalysis = aiResult;
        checks.push({
          name: "AI Vision Analysis",
          passed: aiResult.confidence >= 60,
          detail: `Confidence: ${aiResult.confidence}% — ${aiResult.description}`,
          weight: 20,
        });
      }
    }

    // Calculate weighted score
    const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
    const earnedWeight = checks.filter(c => c.passed).reduce((sum, c) => sum + c.weight, 0);
    const score = Math.round((earnedWeight / totalWeight) * 100);

    // Auto-approve/reject based on score
    const autoStatus = score >= 80 ? "approved" : score <= 30 ? "rejected" : null;

    if (autoStatus) {
      const aiNote = aiAnalysis ? ` AI: ${aiAnalysis.confidence}% confidence.` : "";
      await db.run(
        "UPDATE daily_proofs SET status = ?, admin_notes = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?",
        autoStatus, `Score: ${score}/100.${aiNote} Auto-${autoStatus}.`, proof_id
      );

      if (autoStatus === "approved") {
        await db.run(
          "UPDATE stakes SET completed_days = completed_days + 1, current_streak = current_streak + 1 WHERE id = ?",
          proof.stake_id
        );
      } else {
        const stake = await db.get("SELECT daily_amount FROM stakes WHERE id = ?", proof.stake_id) as any;
        await db.run(
          "UPDATE stakes SET total_burned = total_burned + ?, missed_days = missed_days + 1, current_streak = 0 WHERE id = ?",
          stake.daily_amount, proof.stake_id
        );
      }
    }

    return NextResponse.json({
      verification: { passed: score >= 60, score, checks, autoStatus, aiAnalysis },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
