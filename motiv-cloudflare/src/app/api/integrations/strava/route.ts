import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

// GET: Start OAuth flow or get integration status
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const action = req.nextUrl.searchParams.get("action");

  if (action === "connect") {
    if (!STRAVA_CLIENT_ID) {
      return NextResponse.json({ error: "Strava not configured" }, { status: 400 });
    }

    const redirectUri = `${APP_URL}/api/integrations/strava/callback`;
    const scope = "activity:read_all";
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${user.userId}`;

    return NextResponse.json({ url: authUrl });
  }

  // Return current integration status
  const integration = await db.get(
    "SELECT id, provider, provider_user_id, created_at FROM integrations WHERE user_id = ? AND provider = 'strava'",
    user.userId
  );

  return NextResponse.json({ connected: !!integration, integration });
}

// DELETE: Disconnect Strava
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await db.run("DELETE FROM integrations WHERE user_id = ? AND provider = 'strava'", user.userId);

  return NextResponse.json({ success: true });
}
