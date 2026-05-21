import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "edge";

// POST /api/cron/daily-burn
// Runs at midnight (or manually) to burn missed days for all active stakes.
export async function POST(req: Request) {
  // Simple auth: check cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Get all active stakes
  const activeStakes = await db.all("SELECT * FROM stakes WHERE status = 'active'") as any[];

  let burned = 0;
  let verified = 0;
  let completed = 0;

  for (const stake of activeStakes) {
    const startDate = new Date(stake.start_date);

    // Skip if yesterday is before stake started
    if (yesterday < startDate) continue;

    // Calculate which day number yesterday was
    const dayNumber =
      Math.floor(
        (yesterday.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    // Skip if day is beyond duration
    if (dayNumber > stake.duration_days) continue;

    // Skip off-days (days_per_week feature)
    if (stake.days_per_week && stake.days_per_week < 7 && stake.active_days) {
      const activeDays = stake.active_days.split(",").map(Number);
      const yesterdayDow = yesterday.getDay(); // 0=Sun, 6=Sat
      if (!activeDays.includes(yesterdayDow)) continue; // Not an active day, skip
    }

    // Check if there's an approved proof for yesterday
    const proof = await db.get(
      `SELECT * FROM daily_proofs
       WHERE stake_id = ? AND day_number = ? AND status = 'approved'`,
      stake.id, dayNumber
    ) as any;

    // Check if admin approved a leeway request for this day — skips the burn
    const leeway = await db.get(
      `SELECT id FROM leeway_requests
       WHERE stake_id = ? AND day_number = ? AND status = 'approved'`,
      stake.id, dayNumber
    ) as any;

    if (proof || leeway) {
      verified++;
    } else {
      // Check if there's a pending or rejected proof
      const pendingProof = await db.get(
        `SELECT * FROM daily_proofs
         WHERE stake_id = ? AND day_number = ? AND status IN ('pending', 'rejected')`,
        stake.id, dayNumber
      ) as any;

      // Mark any pending/rejected proof as missed
      if (pendingProof) {
        await db.run("UPDATE daily_proofs SET status = 'missed' WHERE id = ?", pendingProof.id);
      }

      // Burn the daily amount
      await db.run(
        `UPDATE stakes
         SET total_burned = total_burned + ?,
             missed_days = missed_days + 1,
             current_streak = 0
         WHERE id = ?`,
        stake.daily_amount, stake.id
      );

      burned++;
    }

    // Check if stake has ended
    if (dayNumber >= stake.duration_days) {
      await db.run("UPDATE stakes SET status = 'completed' WHERE id = ?", stake.id);
      completed++;
    }
  }

  return NextResponse.json({
    success: true,
    processed: activeStakes.length,
    burned,
    verified,
    completed,
    date: yesterdayStr,
  });
}
