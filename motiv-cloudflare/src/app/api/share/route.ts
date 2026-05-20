import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");
    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const user = await db.get("SELECT name FROM users WHERE id = ?", userId) as any;
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const stats = await db.get(
      `SELECT
        MAX(current_streak) as best_streak,
        COALESCE(SUM(total_completed), 0) as total_completed,
        COALESCE(SUM(total_amount), 0) as total_staked,
        COUNT(*) as total_stakes
      FROM stakes WHERE user_id = ? AND status IN ('active', 'completed')`,
      userId
    ) as any;

    // Generate a shareable SVG card
    const svg = `
      <svg width="600" height="315" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1c1917"/>
            <stop offset="100%" stop-color="#292524"/>
          </linearGradient>
          <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#f97316"/>
            <stop offset="100%" stop-color="#fb923c"/>
          </linearGradient>
        </defs>
        <rect width="600" height="315" fill="url(#bg)" rx="16"/>
        <rect x="0" y="0" width="600" height="4" fill="url(#accent)"/>
        <text x="40" y="50" font-family="sans-serif" font-size="28" font-weight="bold" fill="#f97316" font-style="italic">Motiv</text>
        <text x="40" y="90" font-family="sans-serif" font-size="14" fill="#78716c">EXECUTE OR FORFEIT</text>
        <text x="40" y="140" font-family="sans-serif" font-size="24" font-weight="bold" fill="white">${user.name}</text>
        <text x="40" y="170" font-family="sans-serif" font-size="14" fill="#a8a29e">${stats.total_stakes} stakes completed</text>
        <text x="40" y="230" font-family="sans-serif" font-size="48" font-weight="bold" fill="#f97316">${stats.best_streak}</text>
        <text x="40" y="255" font-family="sans-serif" font-size="14" fill="#78716c">DAY STREAK</text>
        <text x="220" y="230" font-family="sans-serif" font-size="48" font-weight="bold" fill="#22c55e">${stats.total_completed}</text>
        <text x="220" y="255" font-family="sans-serif" font-size="14" fill="#78716c">DAYS COMPLETED</text>
        <text x="420" y="230" font-family="sans-serif" font-size="24" font-weight="bold" fill="white">${stats.total_staked}</text>
        <text x="420" y="255" font-family="sans-serif" font-size="14" fill="#78716c">TOTAL STAKED</text>
        <text x="40" y="295" font-family="sans-serif" font-size="11" fill="#57534e">motiv.app - Your excuses just got expensive</text>
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
