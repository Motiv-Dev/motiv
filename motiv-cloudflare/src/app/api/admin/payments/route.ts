import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payments = await db.all(
      `SELECT p.*, u.name as user_name, u.email as user_email, s.habit_type, s.total_amount as stake_amount, s.duration_days
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN stakes s ON p.stake_id = s.id
      ORDER BY p.created_at DESC`
    );

    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payment_id, status, admin_notes } = await req.json() as any;

    if (!payment_id || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await db.run(
      "UPDATE payments SET status = ?, admin_notes = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?",
      status, admin_notes || null, payment_id
    );

    // If approved deposit, activate the stake
    if (status === "approved") {
      const payment = await db.get("SELECT * FROM payments WHERE id = ?", payment_id) as any;
      if (payment && payment.type === "deposit" && payment.stake_id) {
        const startDate = new Date().toISOString().split("T")[0];
        const stake = await db.get("SELECT duration_days FROM stakes WHERE id = ?", payment.stake_id) as any;
        const endDate = new Date(Date.now() + stake.duration_days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        await db.run(
          "UPDATE stakes SET status = 'active', start_date = ?, end_date = ? WHERE id = ?",
          startDate, endDate, payment.stake_id
        );
      }

      // If approved withdrawal, mark stake as withdrawn
      if (payment && payment.type === "withdrawal" && payment.stake_id) {
        await db.run("UPDATE stakes SET status = 'withdrawn' WHERE id = ?", payment.stake_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
