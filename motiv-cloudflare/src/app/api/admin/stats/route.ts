import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const totalUsers = ((await db.get("SELECT COUNT(*) as count FROM users")) as any).count;
    const activeStakes = ((await db.get("SELECT COUNT(*) as count FROM stakes WHERE status = 'active'")) as any).count;
    const completedStakes = ((await db.get("SELECT COUNT(*) as count FROM stakes WHERE status = 'completed'")) as any).count;
    const failedStakes = ((await db.get("SELECT COUNT(*) as count FROM stakes WHERE status = 'failed'")) as any).count;
    const totalStaked = ((await db.get("SELECT COALESCE(SUM(total_amount), 0) as total FROM stakes WHERE status IN ('active', 'completed')")) as any).total;
    const totalBurned = ((await db.get("SELECT COALESCE(SUM(total_burned), 0) as total FROM stakes")) as any).total;
    const pendingPayments = ((await db.get("SELECT COUNT(*) as count FROM payments WHERE status = 'pending'")) as any).count;
    const pendingProofs = ((await db.get("SELECT COUNT(*) as count FROM daily_proofs WHERE status = 'submitted'")) as any).count;

    // Platform fees
    const platformFees = ((await db.get("SELECT COALESCE(SUM(platform_fee), 0) as total FROM stakes")) as any).total;
    const totalRevenue = platformFees + totalBurned;

    // Today's proofs submitted
    const todayProofs = ((await db.get("SELECT COUNT(*) as count FROM daily_proofs WHERE DATE(created_at) = DATE('now')")) as any).count;

    // Recent activity feed
    const recentProofs = await db.all(
      `SELECT 'proof' as event_type, dp.id, dp.status, dp.created_at, u.name as user_name, u.email as user_email, s.habit_type, dp.day_number
      FROM daily_proofs dp
      JOIN users u ON dp.user_id = u.id
      JOIN stakes s ON dp.stake_id = s.id
      ORDER BY dp.created_at DESC LIMIT 10`
    );

    const recentPayments = await db.all(
      `SELECT 'payment' as event_type, p.id, p.status, p.created_at, p.amount, p.type, u.name as user_name, u.email as user_email
      FROM payments p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC LIMIT 10`
    );

    const recentStakeUpdates = await db.all(
      `SELECT 'stake' as event_type, s.id, s.status, s.created_at, s.total_amount as amount, s.habit_type, u.name as user_name, u.email as user_email
      FROM stakes s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC LIMIT 10`
    );

    const recentActivity = [...recentProofs, ...recentPayments, ...recentStakeUpdates]
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeStakes,
        completedStakes,
        failedStakes,
        totalStaked,
        totalBurned,
        totalRevenue,
        platformFees,
        pendingPayments,
        pendingProofs,
        todayProofs,
        recentActivity,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
