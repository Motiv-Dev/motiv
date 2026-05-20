import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "motiv-secret-key-change-in-production"
);

export interface JwtPayload {
  userId: number;
  email: string;
  isAdmin?: boolean;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<JwtPayload | null> {
  // Try Clerk auth first
  try {
    const { userId: clerkId } = await auth();
    if (clerkId) {
      let user = await db.get<{ id: number; email: string }>("SELECT id, email FROM users WHERE clerk_id = ?", clerkId);
      if (!user) {
        // Auto-create user from Clerk profile
        const clerkUser = await currentUser();
        const email = clerkUser?.emailAddresses?.[0]?.emailAddress || `${clerkId}@clerk.user`;
        const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || "User";
        const result = await db.run(
          "INSERT INTO users (email, name, password_hash, clerk_id) VALUES (?, ?, ?, ?)",
          email, name, "clerk-managed", clerkId
        );
        // Notify admin — dynamic import so it can't crash auth
        import("@/lib/email").then(m => m.notifyNewUser(email, name)).catch(() => {});
        return { userId: Number(result.meta.last_row_id), email };
      }
      return { userId: user.id, email: user.email };
    }
  } catch {
    // Clerk not available, fall through to JWT
  }

  // Fallback to JWT cookie (for legacy/manual auth)
  const cookieStore = await cookies();
  const token = cookieStore.get("motiv-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAdminUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("motiv-admin-token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.isAdmin) return null;
  return payload;
}
