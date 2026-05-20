import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "edge";

// POST /api/leeway — Request a skip day
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stake_id, reason } = await req.json() as any;
  if (!stake_id || !reason) {
    return NextResponse.json({ error: "stake_id and reason required" }, { status: 400 });
  }

  const stake = await db.get("SELECT * FROM stakes WHERE id = ? AND user_id = ?", stake_id, user.userId) as any;
  if (!stake || stake.status !== "active") {
    return NextResponse.json({ error: "Stake not found or not active" }, { status: 404 });
  }

  // Calculate current day number
  const startDate = new Date(stake.start_date);
  const now = new Date();
  const dayNumber = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Check if already requested for today
  const existing = await db.get(
    "SELECT id FROM leeway_requests WHERE stake_id = ? AND day_number = ?",
    stake_id, dayNumber
  ) as any;

  if (existing) {
    return NextResponse.json({ error: "Already requested skip for today" }, { status: 400 });
  }

  await db.run(
    "INSERT INTO leeway_requests (stake_id, user_id, day_number, reason) VALUES (?, ?, ?, ?)",
    stake_id, user.userId, dayNumber, reason
  );

  return NextResponse.json({ success: true, day_number: dayNumber });
}

// GET /api/leeway — Get user's leeway requests
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await db.all(
    "SELECT lr.*, s.habit_type FROM leeway_requests lr JOIN stakes s ON s.id = lr.stake_id WHERE lr.user_id = ? ORDER BY lr.created_at DESC",
    user.userId
  );

  return NextResponse.json({ requests });
}
