export function generateKeyword(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function isKeywordValid(expiresAt: string): boolean {
  return new Date(expiresAt) > new Date();
}

export function getKeywordExpiry(): string {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5);
  return expiry.toISOString();
}
