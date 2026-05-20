interface CloudflareEnv {
  DB: D1Database;
  R2: R2Bucket;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY?: string;
      JWT_SECRET?: string;
      ADMIN_EMAIL?: string;
      ADMIN_PASSWORD?: string;
      CRON_SECRET?: string;
      STRAVA_CLIENT_ID?: string;
      STRAVA_CLIENT_SECRET?: string;
      NEXT_PUBLIC_APP_URL?: string;
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
      CLERK_SECRET_KEY?: string;
    }
  }
}

export {};
