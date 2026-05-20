import { NextResponse } from "next/server";
import { getCurrentUser, signToken } from "@/lib/auth";

export const runtime = "edge";

// GET /api/auth/extension-token
// Returns a JWT token for the currently logged-in user.
// The extension opens this URL in a browser tab, which redirects to the callback page.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Generate a long-lived token for the extension
  const token = await signToken({ userId: user.userId, email: user.email });

  return NextResponse.json({
    token,
    user_id: user.userId,
    email: user.email,
  });
}
