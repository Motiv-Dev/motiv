import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "edge";

// Receives data from the browser extension
export async function POST(req: NextRequest) {
  try {
    const { user_token, type, data } = await req.json() as any;

    if (!user_token || !type || !data) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify user token (clerk session or custom token)
    const user = await db.get("SELECT id FROM users WHERE clerk_id = ?", user_token) as any;
    if (!user) return NextResponse.json({ error: "Invalid user token" }, { status: 401 });

    if (type === "browsing_violation") {
      // Adult content detected — find active no_porn stake and mark today as failed
      const stake = await db.get(
        "SELECT * FROM stakes WHERE user_id = ? AND habit_type = 'no_porn' AND status = 'active'",
        user.id
      ) as any;

      if (stake) {
        const today = new Date();
        const start = new Date(stake.start_date);
        const dayNumber = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        // Check if proof already exists for today
        const existing = await db.get(
          "SELECT id FROM daily_proofs WHERE stake_id = ? AND day_number = ?",
          stake.id, dayNumber
        ) as any;

        if (!existing) {
          // Create a failed proof
          await db.run(
            `INSERT INTO daily_proofs (stake_id, user_id, day_number, status, admin_notes, verified_at)
            VALUES (?, ?, ?, 'missed', ?, CURRENT_TIMESTAMP)`,
            stake.id, user.id, dayNumber, `Auto-detected violation: ${data.domain || "adult content"}`
          );

          // Burn the daily amount
          await db.run(
            "UPDATE stakes SET total_burned = total_burned + ?, current_streak = 0 WHERE id = ?",
            stake.daily_amount, stake.id
          );
        }

        return NextResponse.json({ violation_recorded: true, stake_id: stake.id });
      }
    }

    if (type === "screentime_report") {
      const stake = await db.get(
        "SELECT * FROM stakes WHERE user_id = ? AND habit_type = 'screentime' AND status = 'active'",
        user.id
      ) as any;

      if (stake) {
        const config = stake.verification_config ? JSON.parse(stake.verification_config) : {};
        const maxMinutes = (config.max_hours || 4) * 60;
        const totalMinutes = data.total_minutes || 0;
        const passed = totalMinutes <= maxMinutes;

        return NextResponse.json({
          reported: true,
          total_minutes: totalMinutes,
          max_minutes: maxMinutes,
          within_limit: passed,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
