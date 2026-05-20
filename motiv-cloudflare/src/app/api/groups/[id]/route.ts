import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const groupId = params.id;

    // Check membership
    const membership = await db.get(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      groupId, user.userId
    ) as any;
    if (!membership) return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });

    // Get group details
    const group = await db.get("SELECT * FROM groups WHERE id = ?", groupId) as any;
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    // Get members with their stake stats
    const members = await db.all(
      `SELECT gm.*, u.name, u.email,
        s.total_completed, s.total_burned, s.current_streak, s.total_amount, s.daily_amount, s.status as stake_status
      FROM group_members gm
      JOIN users u ON u.id = gm.user_id
      LEFT JOIN stakes s ON s.id = gm.stake_id
      WHERE gm.group_id = ?
      ORDER BY s.total_completed DESC`,
      groupId
    ) as any[];

    // Calculate leaderboard
    const totalForfeited = members.reduce((sum: number, m: any) => sum + (m.total_burned || 0), 0);
    const totalCompleted = members.reduce((sum: number, m: any) => sum + (m.total_completed || 0), 0);

    const leaderboard = members.map((m: any) => ({
      name: m.name,
      user_id: m.user_id,
      completed_days: m.total_completed || 0,
      burned: m.total_burned || 0,
      streak: m.current_streak || 0,
      share: totalCompleted > 0 ? ((m.total_completed || 0) / totalCompleted * 100).toFixed(1) : "0",
      potential_payout: totalCompleted > 0 && totalForfeited > 0
        ? Math.round(((m.total_completed || 0) / totalCompleted) * totalForfeited * 0.9)
        : 0,
      is_me: m.user_id === user.userId,
    }));

    return NextResponse.json({
      group,
      members,
      leaderboard,
      stats: {
        total_forfeited: totalForfeited,
        platform_cut: Math.round(totalForfeited * 0.1),
        prize_pool: Math.round(totalForfeited * 0.9),
        member_count: members.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
