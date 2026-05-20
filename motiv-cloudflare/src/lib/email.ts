/**
 * Edge-compatible email notifications for Cloudflare version.
 *
 * Since nodemailer requires Node.js TCP/TLS and doesn't work on edge runtime,
 * we relay emails through the Vercel deployment's email webhook endpoint.
 *
 * Fallback: logs to console if the relay is unreachable.
 */

const VERCEL_EMAIL_RELAY = process.env.EMAIL_RELAY_URL || "https://motiv-app-five.vercel.app/api/email-relay";
const EMAIL_RELAY_SECRET = process.env.EMAIL_RELAY_SECRET || "";

async function sendViaRelay(type: string, data: Record<string, any>) {
  if (!EMAIL_RELAY_SECRET) {
    console.log(`[EMAIL SKIPPED] No EMAIL_RELAY_SECRET configured. Type: ${type}`, data);
    return;
  }

  try {
    const res = await fetch(VERCEL_EMAIL_RELAY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${EMAIL_RELAY_SECRET}`,
      },
      body: JSON.stringify({ type, ...data }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[EMAIL RELAY ERROR] ${type}: ${res.status} ${text}`);
    } else {
      console.log(`[EMAIL SENT via relay] ${type}`);
    }
  } catch (err: any) {
    console.error(`[EMAIL RELAY FAILED] ${type}:`, err.message);
  }
}

export function notifyNewUser(email: string, name: string) {
  return sendViaRelay("new_user", { email, name });
}

export function notifyPaymentUploaded(userEmail: string, amount: number, stakeId: number | null) {
  return sendViaRelay("payment_uploaded", { userEmail, amount, stakeId });
}

export function notifyProofSubmitted(userEmail: string, habitType: string, dayNumber: number) {
  return sendViaRelay("proof_submitted", { userEmail, habitType, dayNumber });
}
