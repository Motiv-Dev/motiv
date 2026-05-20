import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    // Get recent burns (missed/rejected proofs)
    const rawBurns = await db.all(
      `SELECT dp.verified_at, dp.status, s.daily_amount, s.habit_type, u.name, u.id as user_id
      FROM daily_proofs dp
      JOIN stakes s ON dp.stake_id = s.id
      JOIN users u ON dp.user_id = u.id
      WHERE dp.status IN ('missed', 'rejected')
      ORDER BY dp.verified_at DESC
      LIMIT 20`
    ) as any[];

    // Privacy: use anonymous usernames
    const burns = rawBurns.map(b => ({
      ...b,
      name: `MOTIVated-${b.user_id}`,
    }));

    return NextResponse.json({ burns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
