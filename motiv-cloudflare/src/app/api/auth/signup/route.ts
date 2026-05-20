import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { email, name, password, phone } = await req.json() as any;

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Email, name, and password are required" }, { status: 400 });
    }

    const existing = await db.get("SELECT id FROM users WHERE email = ?", email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = await db.run(
      "INSERT INTO users (email, name, password_hash, phone) VALUES (?, ?, ?, ?)",
      email, name, hash, phone || null
    );

    const token = await signToken({ userId: Number(result.meta.last_row_id), email });

    const response = NextResponse.json({ success: true, user: { id: result.meta.last_row_id, email, name } });
    response.cookies.set("motiv-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
