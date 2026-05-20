import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user_id, ban } = await req.json() as any;
    if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

    await db.run("UPDATE users SET banned = ? WHERE id = ?", ban ? 1 : 0, user_id);

    // If banning, also fail all their active stakes
    if (ban) {
      await db.run("UPDATE stakes SET status = 'failed' WHERE user_id = ? AND status = 'active'", user_id);
    }

    return NextResponse.json({ success: true, message: ban ? "User banned" : "User unbanned" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
