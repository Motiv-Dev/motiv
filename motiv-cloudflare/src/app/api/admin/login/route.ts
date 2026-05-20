import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";

export const runtime = "edge";

// Brute-force protection
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || "unknown";
    const now = Date.now();

    // Check lockout
    const attempt = loginAttempts.get(ip);
    if (attempt && attempt.lockedUntil > now) {
      const waitSec = Math.ceil((attempt.lockedUntil - now) / 1000);
      return NextResponse.json({ error: `Too many failed attempts. Try again in ${waitSec}s` }, { status: 429 });
    }

    const { email, password } = await req.json() as any;

    // Input validation
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (email.length > 100 || password.length > 200) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const admin = await db.get("SELECT * FROM admin_users WHERE email = ?", email) as any;
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      // Track failed attempt with escalating lockout
      const current = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
      current.count += 1;
      if (current.count >= 15) current.lockedUntil = now + 30 * 60 * 1000;
      else if (current.count >= 10) current.lockedUntil = now + 5 * 60 * 1000;
      else if (current.count >= 5) current.lockedUntil = now + 60 * 1000;
      loginAttempts.set(ip, current);

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Reset on success
    loginAttempts.delete(ip);

    const token = await signToken({ userId: admin.id, email: admin.email, isAdmin: true });

    const response = NextResponse.json({ success: true });
    response.cookies.set("motiv-admin-token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
