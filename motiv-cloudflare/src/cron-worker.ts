export interface Env {
  APP_URL: string;
  CRON_SECRET: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const url = `${env.APP_URL}/api/cron/daily-burn`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.CRON_SECRET}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("[motiv-cron] daily-burn result:", JSON.stringify(data));

      if (!res.ok) {
        throw new Error(`Burn endpoint returned ${res.status}`);
      }
    } catch (err) {
      console.error("[motiv-cron] daily-burn failed:", err);
      // Re-throw so Cloudflare marks the cron invocation as failed
      throw err;
    }
  },
};
