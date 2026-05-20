import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateMotivation } from "@/lib/ai";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Get user's best active streak
    const activeStake = await db.get(
      `SELECT habit_type, current_streak FROM stakes
      WHERE user_id = ? AND status = 'active'
      ORDER BY current_streak DESC LIMIT 1`,
      user.userId
    ) as any;

    const streak = activeStake?.current_streak || 0;
    const habitType = activeStake?.habit_type || "general";

    const userData = await db.get("SELECT name FROM users WHERE id = ?", user.userId) as any;
    const userName = userData?.name || "Warrior";

    const message = await generateMotivation(streak, habitType, userName);

    return NextResponse.json({ motivation: message, streak });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
