import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { runAutoVerification } from "@/lib/verification";
import { getCurrentDayNumber } from "@/lib/utils";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { stake_id, proof_id } = await req.json() as any;
    if (!stake_id || !proof_id) {
      return NextResponse.json({ error: "stake_id and proof_id required" }, { status: 400 });
    }

    const stake = await db.get("SELECT * FROM stakes WHERE id = ? AND user_id = ?", stake_id, user.userId) as any;
    if (!stake) return NextResponse.json({ error: "Stake not found" }, { status: 404 });

    const proof = await db.get("SELECT * FROM daily_proofs WHERE id = ? AND stake_id = ?", proof_id, stake_id) as any;
    if (!proof) return NextResponse.json({ error: "Proof not found" }, { status: 404 });

    const verificationConfig = stake.verification_config ? JSON.parse(stake.verification_config) : {};

    const { autoApproved, results } = await runAutoVerification({
      stakeId: stake.id,
      userId: user.userId,
      habitType: stake.habit_type,
      dayNumber: getCurrentDayNumber(stake.start_date),
      proofId: proof.id,
      verificationConfig,
      photoUrl: proof.photo_url,
      gpsLat: proof.gps_lat,
      gpsLng: proof.gps_lng,
    });

    return NextResponse.json({
      auto_approved: autoApproved,
      results,
      message: autoApproved
        ? "Proof auto-verified and approved!"
        : results.length > 0
          ? "Auto-verification ran but didn't pass — submitted for manual review"
          : "No auto-verification methods configured — submitted for manual review",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
