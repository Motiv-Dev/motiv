import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadToR2, getMimeType } from "@/lib/r2";
import { notifyPaymentUploaded } from "@/lib/email";

export const runtime = "edge";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payments = await db.all(
      `SELECT p.*, s.habit_type, s.total_amount as stake_amount
      FROM payments p
      LEFT JOIN stakes s ON p.stake_id = s.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC`,
      user.userId
    );

    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const formData = await req.formData();
    const stakeId = formData.get("stake_id") as string;
    const amount = formData.get("amount") as string;
    const type = formData.get("type") as string || "deposit";
    const screenshot = formData.get("screenshot") as File;

    if (!stakeId || !amount || !screenshot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save screenshot to R2
    const ext = screenshot.name.split(".").pop();
    const filename = `payments/${crypto.randomUUID()}.${ext}`;
    const buffer = await screenshot.arrayBuffer();
    await uploadToR2(filename, buffer, getMimeType(screenshot.name));
    const screenshotUrl = `/uploads/${filename}`;

    // Verify stake exists if stake_id provided
    const stakeIdNum = parseInt(stakeId);
    if (stakeIdNum) {
      const stake = await db.get("SELECT id FROM stakes WHERE id = ?", stakeIdNum);
      if (!stake) {
        return NextResponse.json({ error: "Stake not found" }, { status: 404 });
      }
    }

    const result = await db.run(
      `INSERT INTO payments (user_id, stake_id, amount, type, screenshot_url)
      VALUES (?, ?, ?, ?, ?)`,
      user.userId, stakeIdNum || null, parseInt(amount), type, screenshotUrl
    );

    // Notify admin about payment upload
    notifyPaymentUploaded(user.email, parseInt(amount), stakeIdNum || null).catch(() => {});

    return NextResponse.json({ payment: { id: result.meta.last_row_id, status: "pending" } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
