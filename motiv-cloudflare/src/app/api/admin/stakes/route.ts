import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("user_id");

    let query = `
      SELECT s.*, u.name as user_name, u.email as user_email,
        (SELECT COUNT(*) FROM daily_proofs dp WHERE dp.stake_id = s.id AND dp.status = 'approved') as completed_days,
        (SELECT COUNT(*) FROM daily_proofs dp WHERE dp.stake_id = s.id AND dp.status = 'missed') as missed_days
      FROM stakes s
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== "all") {
      query += " AND s.status = ?";
      params.push(status);
    }
    if (userId) {
      query += " AND s.user_id = ?";
      params.push(userId);
    }

    query += " ORDER BY s.created_at DESC";

    const stakes = await db.all(query, ...params);
    return NextResponse.json({ stakes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, stake_id, notes } = await req.json() as any;
    if (!action || !stake_id) {
      return NextResponse.json({ error: "Missing action or stake_id" }, { status: 400 });
    }

    const stake = await db.get("SELECT * FROM stakes WHERE id = ?", stake_id) as any;
    if (!stake) return NextResponse.json({ error: "Stake not found" }, { status: 404 });

    switch (action) {
      case "force_complete":
        await db.run("UPDATE stakes SET status = 'completed' WHERE id = ?", stake_id);
        break;
      case "force_fail":
        await db.run("UPDATE stakes SET status = 'failed' WHERE id = ?", stake_id);
        break;
      case "cancel_refund":
        await db.run("UPDATE stakes SET status = 'cancelled' WHERE id = ?", stake_id);
        break;
      case "activate": {
        const startDate = new Date().toISOString().split("T")[0];
        const endDate = new Date(Date.now() + stake.duration_days * 86400000).toISOString().split("T")[0];
        await db.run("UPDATE stakes SET status = 'active', start_date = ?, end_date = ? WHERE id = ?", startDate, endDate, stake_id);
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await db.get("SELECT * FROM stakes WHERE id = ?", stake_id);
    return NextResponse.json({ stake: updated, message: `Stake ${action} successful` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
