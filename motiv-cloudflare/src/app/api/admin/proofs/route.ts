import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const proofs = await db.all(
      `SELECT dp.*, u.name as user_name, u.email as user_email, s.habit_type, s.daily_amount, s.gym_lat as stake_gym_lat, s.gym_lng as stake_gym_lng, s.gym_name
      FROM daily_proofs dp
      JOIN users u ON dp.user_id = u.id
      JOIN stakes s ON dp.stake_id = s.id
      ORDER BY dp.created_at DESC`
    );

    return NextResponse.json({ proofs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { proof_id, status, admin_notes } = await req.json() as any;

    if (!proof_id || !["approved", "rejected", "missed"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await db.run(
      "UPDATE daily_proofs SET status = ?, admin_notes = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?",
      status, admin_notes || null, proof_id
    );

    // Update stake stats
    const proof = await db.get("SELECT * FROM daily_proofs WHERE id = ?", proof_id) as any;
    if (proof) {
      if (status === "approved") {
        await db.run(
          "UPDATE stakes SET total_completed = total_completed + 1, current_streak = current_streak + 1 WHERE id = ?",
          proof.stake_id
        );
      } else if (status === "missed") {
        const stake = await db.get("SELECT * FROM stakes WHERE id = ?", proof.stake_id) as any;
        await db.run(
          "UPDATE stakes SET total_burned = total_burned + ?, current_streak = 0 WHERE id = ?",
          stake.daily_amount, proof.stake_id
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
