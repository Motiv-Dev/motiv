import { db } from "@/lib/db";
import type { VerifyResult, VerifyContext } from "./index";

// Strava: Check if user has a matching activity today
async function checkStrava(userId: number, habitType: string): Promise<{ found: boolean; details: string }> {
  const integration = await db.get(
    "SELECT * FROM integrations WHERE user_id = ? AND provider = 'strava'",
    userId
  ) as any;

  if (!integration) return { found: false, details: "Strava not connected" };

  // Check token expiry and refresh if needed
  let accessToken = integration.access_token;
  if (new Date(integration.expires_at) < new Date()) {
    try {
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
      if (!refreshRes.ok) return { found: false, details: "Failed to refresh Strava token" };
      const tokens: any = await refreshRes.json();
      accessToken = tokens.access_token;
      await db.run(
        "UPDATE integrations SET access_token = ?, refresh_token = ?, expires_at = ? WHERE id = ?",
        tokens.access_token, tokens.refresh_token, new Date(tokens.expires_at * 1000).toISOString(), integration.id
      );
    } catch {
      return { found: false, details: "Strava token refresh failed" };
    }
  }

  // Fetch today's activities
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const after = Math.floor(today.getTime() / 1000);

  try {
    const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=10`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });
    if (!res.ok) return { found: false, details: "Failed to fetch Strava activities" };

    const activities: any = await res.json();
    if (!activities.length) return { found: false, details: "No Strava activities found today" };

    // Map habit types to Strava activity types
    const activityTypes: Record<string, string[]> = {
      fitness: ["WeightTraining", "Crossfit", "Workout", "Run", "Ride", "Swim", "Yoga", "Hike", "Walk"],
      gym: ["WeightTraining", "Crossfit", "Workout"],
      running: ["Run", "VirtualRun", "TrailRun"],
      cycling: ["Ride", "VirtualRide"],
    };

    const validTypes = activityTypes[habitType] || activityTypes.fitness;
    const matching = activities.filter((a: any) => validTypes.includes(a.type));

    if (matching.length > 0) {
      const best = matching[0];
      return { found: true, details: `Strava: ${best.type} - "${best.name}" (${Math.round(best.elapsed_time / 60)} min)` };
    }

    return { found: false, details: `Strava activities today don't match ${habitType} type` };
  } catch {
    return { found: false, details: "Strava API request failed" };
  }
}

// GPS: Check if user is within radius of registered gym
async function checkGPS(ctx: VerifyContext): Promise<{ within: boolean; distance: number; details: string }> {
  const stake = await db.get<{ gym_lat: number; gym_lng: number; gym_name: string }>(
    "SELECT gym_lat, gym_lng, gym_name FROM stakes WHERE id = ?",
    ctx.stakeId
  );

  if (!stake?.gym_lat || !stake?.gym_lng) return { within: false, distance: -1, details: "No gym location registered" };
  if (!ctx.gpsLat || !ctx.gpsLng) return { within: false, distance: -1, details: "No GPS data in proof" };

  // Haversine distance
  const R = 6371000; // meters
  const dLat = (ctx.gpsLat - stake.gym_lat) * Math.PI / 180;
  const dLng = (ctx.gpsLng - stake.gym_lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(stake.gym_lat * Math.PI / 180) * Math.cos(ctx.gpsLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const maxRadius = 200; // meters
  return {
    within: distance <= maxRadius,
    distance: Math.round(distance),
    details: distance <= maxRadius
      ? `GPS verified: ${Math.round(distance)}m from ${stake.gym_name || "gym"}`
      : `Too far from gym: ${Math.round(distance)}m (max ${maxRadius}m)`,
  };
}

export async function verifyFitness(method: string, config: any, ctx: VerifyContext): Promise<VerifyResult> {
  switch (method) {
    case "strava": {
      const result = await checkStrava(ctx.userId, ctx.habitType);
      return { passed: result.found, method: "strava", score: result.found ? 100 : 0, details: result.details };
    }
    case "gps": {
      const result = await checkGPS(ctx);
      return { passed: result.within, method: "gps", score: result.within ? 90 : 0, details: result.details };
    }
    default:
      return { passed: false, method, score: 0, details: "Unknown fitness verification method" };
  }
}
