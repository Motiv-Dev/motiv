import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadToR2, getMimeType } from "@/lib/r2";
import { getCurrentDayNumber } from "@/lib/utils";
import { runAutoVerification } from "@/lib/verification";
import { notifyProofSubmitted } from "@/lib/email";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const stakeId = req.nextUrl.searchParams.get("stake_id");

    let proofs;
    if (stakeId) {
      proofs = await db.all("SELECT * FROM daily_proofs WHERE stake_id = ? AND user_id = ? ORDER BY day_number ASC", stakeId, user.userId);
    } else {
      proofs = await db.all("SELECT * FROM daily_proofs WHERE user_id = ? ORDER BY created_at DESC", user.userId);
    }

    return NextResponse.json({ proofs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const formData = await req.formData();
    const stakeId = formData.get("stake_id") as string;
    const keyword = formData.get("keyword") as string;
    const gpsLat = formData.get("gps_lat") as string;
    const gpsLng = formData.get("gps_lng") as string;
    const photo = formData.get("photo") as File | null;
    const screentime = formData.get("screentime") as File | null;

    if (!stakeId || !keyword) {
      return NextResponse.json({ error: "Stake ID and keyword are required" }, { status: 400 });
    }

    // File size protection (max 5MB per file)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (photo && photo.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Photo too large. Max 5MB." }, { status: 413 });
    }
    if (screentime && screentime.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Screenshot too large. Max 5MB." }, { status: 413 });
    }

    // Verify stake belongs to user and is active
    const stake = await db.get("SELECT * FROM stakes WHERE id = ? AND user_id = ? AND status = 'active'", stakeId, user.userId) as any;
    if (!stake) {
      return NextResponse.json({ error: "Active stake not found" }, { status: 404 });
    }

    // Check keyword validity
    const dayNumber = getCurrentDayNumber(stake.start_date);
    const existingProof = await db.get(
      "SELECT * FROM daily_proofs WHERE stake_id = ? AND day_number = ?",
      stakeId, dayNumber
    ) as any;

    if (existingProof && existingProof.status === 'approved') {
      return NextResponse.json({ error: "Proof already submitted and approved for today" }, { status: 400 });
    }

    if (existingProof && existingProof.status === 'submitted') {
      return NextResponse.json({ error: "Proof already submitted — waiting for review" }, { status: 400 });
    }

    if (existingProof && existingProof.status !== 'rejected' && existingProof.keyword !== keyword) {
      return NextResponse.json({ error: "Invalid keyword" }, { status: 400 });
    }

    if (existingProof && existingProof.status !== 'rejected' && new Date(existingProof.keyword_expires_at) < new Date()) {
      return NextResponse.json({ error: "Keyword has expired. Generate a new one." }, { status: 400 });
    }

    // Save files to R2
    let photoUrl = null;
    let photoHash = null;
    if (photo) {
      const ext = photo.name.split(".").pop();
      const filename = `proofs/photo-${crypto.randomUUID()}.${ext}`;
      const buffer = await photo.arrayBuffer();
      await uploadToR2(filename, buffer, getMimeType(photo.name));
      photoUrl = `/uploads/${filename}`;

      // SHA-256 hash for duplicate detection
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      photoHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

      // Check for duplicate photo
      const duplicate = await db.get(
        "SELECT id, day_number FROM daily_proofs WHERE photo_hash = ? AND user_id = ?",
        photoHash, user.userId
      ) as any;

      if (duplicate) {
        return NextResponse.json({
          error: `This photo was already used for day ${duplicate.day_number}. Take a new photo.`,
        }, { status: 400 });
      }
    }

    let screentimeUrl = null;
    if (screentime) {
      const ext = screentime.name.split(".").pop();
      const filename = `proofs/screentime-${crypto.randomUUID()}.${ext}`;
      const buffer = await screentime.arrayBuffer();
      await uploadToR2(filename, buffer, getMimeType(screentime.name));
      screentimeUrl = `/uploads/${filename}`;
    }

    if (existingProof) {
      await db.run(
        `UPDATE daily_proofs SET photo_url = ?, photo_hash = ?, gps_lat = ?, gps_lng = ?, screentime_url = ?, keyword = ?, keyword_expires_at = ?, status = 'submitted', submitted_at = CURRENT_TIMESTAMP, admin_notes = NULL
        WHERE id = ?`,
        photoUrl, photoHash, gpsLat ? parseFloat(gpsLat) : null, gpsLng ? parseFloat(gpsLng) : null, screentimeUrl, keyword, new Date(Date.now() + 5 * 60 * 1000).toISOString(), existingProof.id
      );
    } else {
      await db.run(
        `INSERT INTO daily_proofs (stake_id, user_id, day_number, keyword, keyword_expires_at, photo_url, photo_hash, gps_lat, gps_lng, screentime_url, status, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', CURRENT_TIMESTAMP)`,
        stakeId, user.userId, dayNumber, keyword, new Date(Date.now() + 5 * 60 * 1000).toISOString(), photoUrl, photoHash, gpsLat ? parseFloat(gpsLat) : null, gpsLng ? parseFloat(gpsLng) : null, screentimeUrl
      );
    }

    // Get the proof ID for auto-verification
    let proofId = existingProof?.id;
    if (!proofId) {
      const newProof = await db.get("SELECT id FROM daily_proofs WHERE stake_id = ? AND day_number = ?", stakeId, dayNumber) as any;
      proofId = newProof?.id;
    }

    // Run auto-verification pipeline
    let autoResult = null;
    if (proofId) {
      try {
        const verificationConfig = stake.verification_config ? JSON.parse(stake.verification_config) : {};
        const result = await runAutoVerification({
          stakeId: parseInt(stakeId),
          userId: user.userId,
          habitType: stake.habit_type,
          dayNumber,
          proofId,
          verificationConfig,
          photoUrl: photoUrl || undefined,
          gpsLat: gpsLat ? parseFloat(gpsLat) : undefined,
          gpsLng: gpsLng ? parseFloat(gpsLng) : undefined,
        });
        autoResult = result;
      } catch (e) {
        // Auto-verify failed silently — falls back to manual review
      }
    }

    // Notify admin about proof submission
    notifyProofSubmitted(user.email, stake.habit_type, dayNumber).catch(() => {});

    return NextResponse.json({
      success: true,
      auto_verified: autoResult?.autoApproved || false,
      message: autoResult?.autoApproved
        ? "Proof auto-verified and approved!"
        : "Proof submitted for verification",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
