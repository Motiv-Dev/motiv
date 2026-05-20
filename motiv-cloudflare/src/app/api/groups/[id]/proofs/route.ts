import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const groupId = params.id;

    // Verify membership
    const membership = await db.get(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      groupId, user.userId
    ) as any;
    if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    // Get today's proofs from all group members
    const group = await db.get("SELECT * FROM groups WHERE id = ?", groupId) as any;
    if (!group || !group.start_date) {
      return NextResponse.json({ proofs: [], message: "Group hasn't started yet" });
    }

    const today = new Date();
    const start = new Date(group.start_date);
    const dayNumber = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const proofs = await db.all(
      `SELECT dp.*, u.name as user_name,
        (SELECT COUNT(*) FROM group_votes gv WHERE gv.proof_id = dp.id AND gv.vote = 'approve') as approve_count,
        (SELECT COUNT(*) FROM group_votes gv WHERE gv.proof_id = dp.id AND gv.vote = 'reject') as reject_count,
        (SELECT gv2.vote FROM group_votes gv2 WHERE gv2.proof_id = dp.id AND gv2.voter_id = ?) as my_vote
      FROM daily_proofs dp
      JOIN group_members gm ON gm.stake_id = dp.stake_id AND gm.group_id = ?
      JOIN users u ON u.id = dp.user_id
      WHERE dp.day_number = ?
      ORDER BY dp.submitted_at DESC`,
      user.userId, groupId, dayNumber
    );

    return NextResponse.json({ proofs, day_number: dayNumber });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
