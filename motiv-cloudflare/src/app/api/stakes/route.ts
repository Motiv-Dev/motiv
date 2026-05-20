import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const stakes = await db.all(
      `SELECT s.*,
        (SELECT COUNT(*) FROM daily_proofs dp WHERE dp.stake_id = s.id AND dp.status = 'approved') as completed_days,
        (SELECT COUNT(*) FROM daily_proofs dp WHERE dp.stake_id = s.id AND dp.status = 'missed') as missed_days
      FROM stakes s WHERE s.user_id = ? ORDER BY s.created_at DESC`,
      user.userId
    ) as any[];

    // Attach per-day proof statuses for heatmap/ring
    const stakeIds = stakes.map((s: any) => s.id);
    let proofs: any[] = [];
    if (stakeIds.length > 0) {
      proofs = await db.all(
        `SELECT stake_id, day_number, status FROM daily_proofs WHERE stake_id IN (${stakeIds.map(() => '?').join(',')}) ORDER BY day_number ASC`,
        ...stakeIds
      );
    }

    const proofsByStake: Record<number, { day: number; status: string }[]> = {};
    for (const p of proofs) {
      if (!proofsByStake[p.stake_id]) proofsByStake[p.stake_id] = [];
      proofsByStake[p.stake_id].push({ day: p.day_number, status: p.status });
    }

    // Get today's proof for each active stake (for dashboard feedback)
    const todayProofs: Record<number, any> = {};
    for (const s of stakes) {
      if (s.status !== "active") continue;
      const startDate = new Date(s.start_date);
      const now = new Date();
      const dayNumber = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (dayNumber < 1 || dayNumber > s.duration_days) continue;
      const todayProof = await db.get(
        `SELECT status, admin_notes, submitted_at FROM daily_proofs
         WHERE stake_id = ? AND day_number = ? ORDER BY id DESC LIMIT 1`,
        s.id, dayNumber
      ) as any;
      if (todayProof) {
        todayProofs[s.id] = { ...todayProof, day_number: dayNumber };
      }
    }

    const stakesWithDays = stakes.map((s: any) => ({
      ...s,
      daily_statuses: proofsByStake[s.id] || [],
      today_proof: todayProofs[s.id] || null,
    }));

    return NextResponse.json({ stakes: stakesWithDays });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { habit_type, habit_description, total_amount, duration_days, days_per_week, active_days, gym_lat, gym_lng, gym_name, verification_config, verification_methods } = await req.json() as any;

    if (!habit_type || !total_amount || !duration_days) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (total_amount < 100 || total_amount > 25000) {
      return NextResponse.json({ error: "Stake must be between ₹100 and ₹25,000" }, { status: 400 });
    }

    if (duration_days < 7 || duration_days > 42) {
      return NextResponse.json({ error: "Duration must be 7-42 days" }, { status: 400 });
    }

    const daily_amount = Math.ceil(total_amount / duration_days);

    // Platform fee based on stake amount
    let platform_fee = 9;
    if (total_amount >= 10000) platform_fee = 99;
    else if (total_amount >= 5000) platform_fee = 69;
    else if (total_amount >= 2500) platform_fee = 49;
    else if (total_amount >= 1000) platform_fee = 29;
    else if (total_amount >= 500) platform_fee = 19;

    const configJson = verification_config ? JSON.stringify(verification_config) : null;
    const daysPerWeek = days_per_week || 7;
    const activeDaysStr = active_days || "0,1,2,3,4,5,6";
    const result = await db.run(
      `INSERT INTO stakes (user_id, habit_type, habit_description, total_amount, daily_amount, duration_days, days_per_week, active_days, platform_fee, gym_lat, gym_lng, gym_name, verification_config)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      user.userId, habit_type, habit_description || null, total_amount, daily_amount, duration_days, daysPerWeek, activeDaysStr, platform_fee, gym_lat || null, gym_lng || null, gym_name || null, configJson
    );

    const stakeId = result.meta.last_row_id;

    // Save verification methods
    if (verification_methods && Array.isArray(verification_methods)) {
      for (const vm of verification_methods) {
        await db.run(
          "INSERT INTO verification_methods (stake_id, method, config, enabled) VALUES (?, ?, ?, 1)",
          stakeId, vm.method, vm.config ? JSON.stringify(vm.config) : null
        );
      }
    }

    const stake = await db.get("SELECT * FROM stakes WHERE id = ?", stakeId);

    return NextResponse.json({ stake }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
