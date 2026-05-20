import { NextRequest, NextResponse } from "next/server";
import { downloadFromR2, getMimeType } from "@/lib/r2";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join("/");

    // Security: prevent path traversal
    if (filePath.includes("..") || filePath.includes("~")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Only allow uploads subdirectories
    if (!filePath.startsWith("proofs/") && !filePath.startsWith("payments/")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Read from R2
    const r2Object = await downloadFromR2(filePath);
    if (!r2Object) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const contentType = r2Object.httpMetadata?.contentType || getMimeType(filePath);

    return new NextResponse(r2Object.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
