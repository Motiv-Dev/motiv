import { getRequestContext } from "@cloudflare/next-on-pages";

/**
 * Get the R2 bucket binding from Cloudflare request context.
 */
export function getR2(): R2Bucket {
  return (getRequestContext().env as any).R2;
}

/**
 * Upload a file to R2 and return the key (path).
 */
export async function uploadToR2(
  key: string,
  data: ArrayBuffer | Uint8Array | ReadableStream,
  contentType?: string
): Promise<string> {
  const r2 = getR2();
  await r2.put(key, data, {
    httpMetadata: contentType ? { contentType } : undefined,
  });
  return key;
}

/**
 * Download a file from R2.
 * Returns the R2ObjectBody or null if not found.
 */
export async function downloadFromR2(key: string): Promise<R2ObjectBody | null> {
  const r2 = getR2();
  return r2.get(key);
}

/**
 * Delete a file from R2.
 */
export async function deleteFromR2(key: string): Promise<void> {
  const r2 = getR2();
  await r2.delete(key);
}

/**
 * Get the MIME type from a file extension.
 */
export function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    mov: "video/quicktime",
    pdf: "application/pdf",
  };
  return types[ext] || "application/octet-stream";
}
