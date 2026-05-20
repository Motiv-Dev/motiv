import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const rawLeaderboard = await db.all(
      `SELECT
        u.id,
        u.name,
        MAX(s.current_streak) as best_streak,
        COALESCE(SUM(s.total_completed), 0) as total_completed,
        COALESCE(SUM(s.total_amount), 0) as total_staked,
        COALESCE(SUM(s.total_burned), 0) as total_burned,
        COUNT(DISTINCT s.id) as total_stakes
      FROM users u
      JOIN stakes s ON s.user_id = u.id AND s.status IN ('active', 'completed')
      GROUP BY u.id
      ORDER BY best_streak DESC, total_completed DESC
      LIMIT 50`
    ) as any[];

    // Privacy: replace real names with anonymous usernames
    const leaderboard = rawLeaderboard.map((user, i) => ({
      ...user,
      name: `MOTIVated-${user.id}`,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
