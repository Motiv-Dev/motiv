import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateKeyword, getKeywordExpiry } from "@/lib/keyword";
import { getCurrentDayNumber } from "@/lib/utils";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { stake_id } = await req.json() as any;
    if (!stake_id) return NextResponse.json({ error: "Stake ID required" }, { status: 400 });

    const stake = await db.get("SELECT * FROM stakes WHERE id = ? AND user_id = ? AND status = 'active'", stake_id, user.userId) as any;
    if (!stake) return NextResponse.json({ error: "Active stake not found" }, { status: 404 });

    const dayNumber = getCurrentDayNumber(stake.start_date);
    const keyword = generateKeyword();
    const expiresAt = getKeywordExpiry();

    // Upsert the proof record with keyword
    const existing = await db.get("SELECT id FROM daily_proofs WHERE stake_id = ? AND day_number = ?", stake_id, dayNumber) as any;

    if (existing) {
      await db.run("UPDATE daily_proofs SET keyword = ?, keyword_expires_at = ? WHERE id = ?", keyword, expiresAt, existing.id);
    } else {
      await db.run(
        `INSERT INTO daily_proofs (stake_id, user_id, day_number, keyword, keyword_expires_at)
        VALUES (?, ?, ?, ?, ?)`,
        stake_id, user.userId, dayNumber, keyword, expiresAt
      );
    }

    return NextResponse.json({ keyword, expires_at: expiresAt, day_number: dayNumber });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
