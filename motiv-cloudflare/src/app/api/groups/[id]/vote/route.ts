import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "edge";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { proof_id, vote } = await req.json() as any;
    if (!proof_id || !["approve", "reject"].includes(vote)) {
      return NextResponse.json({ error: "proof_id and vote (approve/reject) required" }, { status: 400 });
    }

    const groupId = params.id;

    // Verify membership
    const membership = await db.get(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      groupId, user.userId
    ) as any;
    if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    // Can't vote on own proof
    const proof = await db.get("SELECT * FROM daily_proofs WHERE id = ?", proof_id) as any;
    if (!proof) return NextResponse.json({ error: "Proof not found" }, { status: 404 });
    if (proof.user_id === user.userId) return NextResponse.json({ error: "Can't vote on your own proof" }, { status: 400 });

    // Check not already voted
    const existingVote = await db.get(
      "SELECT id FROM group_votes WHERE proof_id = ? AND voter_id = ?",
      proof_id, user.userId
    ) as any;
    if (existingVote) return NextResponse.json({ error: "Already voted" }, { status: 409 });

    // Cast vote
    await db.run("INSERT INTO group_votes (proof_id, voter_id, vote) VALUES (?, ?, ?)", proof_id, user.userId, vote);

    // Check if majority reached
    const memberCount = await db.get(
      "SELECT COUNT(*) as c FROM group_members WHERE group_id = ?",
      groupId
    ) as any;

    const votes = await db.all("SELECT vote, COUNT(*) as c FROM group_votes WHERE proof_id = ? GROUP BY vote", proof_id) as any[];
    const approves = votes.find((v: any) => v.vote === "approve")?.c || 0;
    const rejects = votes.find((v: any) => v.vote === "reject")?.c || 0;
    const totalVotes = approves + rejects;
    const required = Math.ceil((memberCount.c - 1) / 2);

    let resolved = false;
    if (approves >= required) {
      await db.run(
        "UPDATE daily_proofs SET status = 'approved', admin_notes = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?",
        `Group vote: ${approves} approve, ${rejects} reject`, proof_id
      );
      await db.run(
        "UPDATE stakes SET total_completed = total_completed + 1, current_streak = current_streak + 1 WHERE id = ?",
        proof.stake_id
      );
      resolved = true;
    } else if (rejects >= required) {
      await db.run(
        "UPDATE daily_proofs SET status = 'rejected', admin_notes = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?",
        `Group vote: ${approves} approve, ${rejects} reject`, proof_id
      );
      resolved = true;
    }

    return NextResponse.json({
      vote_recorded: true,
      approves,
      rejects,
      total_votes: totalVotes,
      required,
      resolved,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
