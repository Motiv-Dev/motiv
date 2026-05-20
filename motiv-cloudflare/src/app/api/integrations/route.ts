import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

// GET: List all integrations for current user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const integrations = await db.all(
    "SELECT id, provider, provider_user_id, created_at FROM integrations WHERE user_id = ?",
    user.userId
  );

  return NextResponse.json({ integrations });
}

// POST: Verify a Strava activity for a stake
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { stake_id } = await req.json() as any;

  // Get Strava integration
  const integration = await db.get(
    "SELECT * FROM integrations WHERE user_id = ? AND provider = 'strava'",
    user.userId
  ) as any;

  if (!integration) {
    return NextResponse.json({ error: "Strava not connected" }, { status: 400 });
  }

  // Check if token needs refresh
  let accessToken = integration.access_token;
  if (new Date(integration.expires_at) < new Date()) {
    const refreshRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: integration.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (refreshRes.ok) {
      const refreshData: any = await refreshRes.json();
      accessToken = refreshData.access_token;
      await db.run(
        `UPDATE integrations SET access_token = ?, refresh_token = ?, expires_at = datetime(?, 'unixepoch')
        WHERE id = ?`,
        refreshData.access_token, refreshData.refresh_token, refreshData.expires_at, integration.id
      );
    } else {
      return NextResponse.json({ error: "Failed to refresh Strava token" }, { status: 400 });
    }
  }

  // Fetch today's activities
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const activitiesRes = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${Math.floor(todayStart.getTime() / 1000)}&per_page=10`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!activitiesRes.ok) {
    return NextResponse.json({ error: "Failed to fetch Strava activities" }, { status: 400 });
  }

  const activities: any = await activitiesRes.json();

  // Check if any activity matches the stake's habit type
  const stake = await db.get("SELECT * FROM stakes WHERE id = ? AND user_id = ?", stake_id, user.userId) as any;
  if (!stake) return NextResponse.json({ error: "Stake not found" }, { status: 404 });

  const habitToStravaType: Record<string, string[]> = {
    gym: ["WeightTraining", "Crossfit", "Workout"],
    running: ["Run", "VirtualRun", "TrailRun"],
    cycling: ["Ride", "VirtualRide"],
    swimming: ["Swim"],
    yoga: ["Yoga"],
  };

  const validTypes = habitToStravaType[stake.habit_type] || [];
  const matchingActivity = activities.find((a: any) => validTypes.includes(a.type));

  if (matchingActivity) {
    return NextResponse.json({
      verified: true,
      activity: {
        name: matchingActivity.name,
        type: matchingActivity.type,
        distance: matchingActivity.distance,
        duration: matchingActivity.moving_time,
        start_date: matchingActivity.start_date,
      },
    });
  }

  return NextResponse.json({
    verified: false,
    message: `No ${stake.habit_type} activity found on Strava today`,
    activities: activities.map((a: any) => ({ name: a.name, type: a.type })),
  });
}
