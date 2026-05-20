import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = "edge";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get users from Clerk (source of truth)
    const clerk = await clerkClient();
    const clerkUsers = await clerk.users.getUserList({ limit: 100, orderBy: "-created_at" });

    const users = await Promise.all(
      clerkUsers.data.map(async (cu) => {
        const email = cu.emailAddresses?.[0]?.emailAddress || "";
        const name = [cu.firstName, cu.lastName].filter(Boolean).join(" ") || "User";

        // Try to get local DB stats if user exists there
        const localUser = await db.get<{ id: number }>("SELECT id FROM users WHERE clerk_id = ?", cu.id);
        let total_stakes = 0, total_staked = 0, total_burned = 0;
        if (localUser) {
          const stats = await db.get<{ total_stakes: number; total_staked: number; total_burned: number }>(
            `SELECT COUNT(*) as total_stakes,
              COALESCE(SUM(total_amount), 0) as total_staked,
              COALESCE(SUM(total_burned), 0) as total_burned
            FROM stakes WHERE user_id = ?`,
            localUser.id
          );
          total_stakes = stats?.total_stakes || 0;
          total_staked = stats?.total_staked || 0;
          total_burned = stats?.total_burned || 0;
        }

        return {
          id: localUser?.id || cu.id,
          email,
          name,
          phone: cu.phoneNumbers?.[0]?.phoneNumber || null,
          upi_id: null,
          created_at: new Date(cu.createdAt).toISOString(),
          total_stakes,
          total_staked,
          total_burned,
        };
      })
    );

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
