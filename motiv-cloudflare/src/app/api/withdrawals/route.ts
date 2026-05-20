import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const withdrawals = await db.all(
      `SELECT p.*, s.habit_type, s.total_amount as stake_amount
      FROM payments p
      LEFT JOIN stakes s ON p.stake_id = s.id
      WHERE p.user_id = ? AND p.type = 'withdrawal'
      ORDER BY p.created_at DESC`,
      user.userId
    );

    return NextResponse.json({ withdrawals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { stake_id, upi_id } = await req.json() as any;
    if (!stake_id) return NextResponse.json({ error: "Stake ID required" }, { status: 400 });

    // Check stake is completed
    const stake = await db.get(
      "SELECT * FROM stakes WHERE id = ? AND user_id = ? AND status = 'completed'",
      stake_id, user.userId
    ) as any;

    if (!stake) return NextResponse.json({ error: "No completed stake found" }, { status: 404 });

    // Calculate refund = total - burned
    const refund = stake.total_amount - stake.total_burned;
    if (refund <= 0) return NextResponse.json({ error: "No refund available — all funds burned" }, { status: 400 });

    // Check no existing withdrawal for this stake
    const existing = await db.get(
      "SELECT id FROM payments WHERE stake_id = ? AND type = 'withdrawal'",
      stake_id
    ) as any;
    if (existing) return NextResponse.json({ error: "Withdrawal already requested" }, { status: 409 });

    // Update user UPI if provided
    if (upi_id) {
      await db.run("UPDATE users SET upi_id = ? WHERE id = ?", upi_id, user.userId);
    }

    // Create withdrawal request
    const result = await db.run(
      `INSERT INTO payments (user_id, stake_id, amount, type, status)
      VALUES (?, ?, ?, 'withdrawal', 'pending')`,
      user.userId, stake_id, refund
    );

    return NextResponse.json({
      withdrawal: { id: result.meta.last_row_id, amount: refund, status: "pending" },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
