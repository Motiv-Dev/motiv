import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "edge";

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || "";
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state"); // user_id
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(`${APP_URL}/integrations?error=denied`);
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${APP_URL}/integrations?error=token_failed`);
    }

    const tokenData: any = await tokenRes.json();

    // Upsert integration
    await db.run(
      `INSERT INTO integrations (user_id, provider, access_token, refresh_token, provider_user_id, expires_at)
      VALUES (?, 'strava', ?, ?, ?, datetime(?, 'unixepoch'))
      ON CONFLICT(user_id, provider) DO UPDATE SET
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        provider_user_id = excluded.provider_user_id,
        expires_at = excluded.expires_at`,
      parseInt(state),
      tokenData.access_token,
      tokenData.refresh_token,
      String(tokenData.athlete?.id || ""),
      tokenData.expires_at
    );

    return NextResponse.redirect(`${APP_URL}/integrations?success=strava`);
  } catch (err: any) {
    console.error("Strava callback error:", err);
    return NextResponse.redirect(`${APP_URL}/integrations?error=unknown`);
  }
}
