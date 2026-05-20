import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const username = req.nextUrl.searchParams.get("username");
    if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });

    const query = `
      query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
        }
      }
    `;

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { username, limit: 15 } }),
    });

    if (!res.ok) return NextResponse.json({ error: "Failed to fetch from LeetCode" }, { status: 502 });

    const data = await res.json() as any;
    const submissions = data.data?.recentAcSubmissionList || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);

    const todaySubmissions = submissions.filter(
      (s: any) => parseInt(s.timestamp) >= todayTimestamp
    );

    return NextResponse.json({
      username,
      today_count: todaySubmissions.length,
      verified: todaySubmissions.length > 0,
      submissions: todaySubmissions.map((s: any) => ({
        title: s.title,
        slug: s.titleSlug,
        time: new Date(parseInt(s.timestamp) * 1000).toISOString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
