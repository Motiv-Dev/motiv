import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { invite_code } = await req.json() as any;
    if (!invite_code) return NextResponse.json({ error: "Invite code required" }, { status: 400 });

    const group = await db.get("SELECT * FROM groups WHERE invite_code = ?", invite_code.toUpperCase()) as any;
    if (!group) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

    if (group.status !== "open") {
      return NextResponse.json({ error: "This group challenge has already started" }, { status: 400 });
    }

    // Check member count
    const memberCount = await db.get("SELECT COUNT(*) as c FROM group_members WHERE group_id = ?", group.id) as any;
    if (memberCount.c >= group.max_members) {
      return NextResponse.json({ error: "Group is full" }, { status: 400 });
    }

    // Check if already a member
    const existing = await db.get("SELECT id FROM group_members WHERE group_id = ? AND user_id = ?", group.id, user.userId) as any;
    if (existing) return NextResponse.json({ error: "Already in this group" }, { status: 409 });

    await db.run("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", group.id, user.userId);

    return NextResponse.json({ group, message: "Joined group successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
