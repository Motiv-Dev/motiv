import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Get groups where user is a member
    const groups = await db.all(
      `SELECT g.*,
        (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count,
        (SELECT gm2.stake_id FROM group_members gm2 WHERE gm2.group_id = g.id AND gm2.user_id = ?) as my_stake_id,
        u.name as creator_name
      FROM groups g
      JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ?
      JOIN users u ON u.id = g.creator_id
      ORDER BY g.created_at DESC`,
      user.userId, user.userId
    );

    return NextResponse.json({ groups });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { name, habit_type, duration_days, stake_amount, max_members } = await req.json() as any;

    if (!name || !habit_type || !duration_days || !stake_amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (stake_amount < 500 || stake_amount > 5000) {
      return NextResponse.json({ error: "Stake must be between ₹500 and ₹5000" }, { status: 400 });
    }

    // Generate invite code using Web Crypto API (no Node crypto needed)
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const inviteCode = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();

    const result = await db.run(
      `INSERT INTO groups (name, invite_code, habit_type, duration_days, stake_amount, max_members, creator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      name, inviteCode, habit_type, duration_days, stake_amount, max_members || 10, user.userId
    );

    // Auto-add creator as member
    await db.run("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", result.meta.last_row_id, user.userId);

    const group = await db.get("SELECT * FROM groups WHERE id = ?", result.meta.last_row_id);

    return NextResponse.json({ group }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
