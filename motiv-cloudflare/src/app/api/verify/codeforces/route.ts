import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const handle = req.nextUrl.searchParams.get("handle");
    if (!handle) return NextResponse.json({ error: "Handle required" }, { status: 400 });

    const res = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=20`);
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch from Codeforces" }, { status: 502 });

    const data = await res.json() as any;
    if (data.status !== "OK") return NextResponse.json({ error: data.comment || "Codeforces API error" }, { status: 502 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);

    const todaySubmissions = (data.result || []).filter(
      (s: any) => s.creationTimeSeconds >= todayTimestamp
    );

    return NextResponse.json({
      handle,
      today_count: todaySubmissions.length,
      verified: todaySubmissions.length > 0,
      submissions: todaySubmissions.map((s: any) => ({
        problem: `${s.problem.contestId}${s.problem.index} - ${s.problem.name}`,
        verdict: s.verdict,
        time: new Date(s.creationTimeSeconds * 1000).toISOString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
