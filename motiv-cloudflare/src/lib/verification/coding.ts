import type { VerifyResult, VerifyContext } from "./index";

// Codeforces: Check if user has submitted today
async function verifyCodeforces(handle: string): Promise<{ submitted: boolean; count: number; details: string }> {
  const res = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=20`);
  if (!res.ok) return { submitted: false, count: 0, details: "Failed to fetch Codeforces data" };

  const data: any = await res.json();
  if (data.status !== "OK") return { submitted: false, count: 0, details: data.comment || "Codeforces API error" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Math.floor(today.getTime() / 1000);

  const todaySubmissions = (data.result || []).filter(
    (s: any) => s.creationTimeSeconds >= todayTimestamp
  );

  return {
    submitted: todaySubmissions.length > 0,
    count: todaySubmissions.length,
    details: todaySubmissions.length > 0
      ? `${todaySubmissions.length} submission(s) today on Codeforces`
      : "No submissions found today on Codeforces",
  };
}

// LeetCode: Check recent submissions via public GraphQL API
async function verifyLeetcode(username: string): Promise<{ submitted: boolean; count: number; details: string }> {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        title
        timestamp
      }
    }
  `;

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { username, limit: 10 },
      }),
    });

    if (!res.ok) return { submitted: false, count: 0, details: "Failed to fetch LeetCode data" };

    const data: any = await res.json();
    const submissions = data.data?.recentAcSubmissionList || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);

    const todaySubmissions = submissions.filter(
      (s: any) => parseInt(s.timestamp) >= todayTimestamp
    );

    return {
      submitted: todaySubmissions.length > 0,
      count: todaySubmissions.length,
      details: todaySubmissions.length > 0
        ? `${todaySubmissions.length} accepted submission(s) today: ${todaySubmissions.map((s: any) => s.title).join(", ")}`
        : "No accepted submissions found today on LeetCode",
    };
  } catch {
    return { submitted: false, count: 0, details: "LeetCode API request failed" };
  }
}

// GitHub: Check if user has commits today via public events API
async function verifyGitHub(username: string): Promise<{ submitted: boolean; count: number; details: string }> {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`, {
      headers: { "Accept": "application/vnd.github.v3+json" },
    });

    if (!res.ok) return { submitted: false, count: 0, details: "Failed to fetch GitHub data" };

    const events: any = await res.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPushEvents = (events || []).filter((e: any) => {
      if (e.type !== "PushEvent") return false;
      const eventDate = new Date(e.created_at);
      return eventDate >= today;
    });

    const totalCommits = todayPushEvents.reduce((sum: number, e: any) => sum + (e.payload?.commits?.length || 0), 0);

    return {
      submitted: totalCommits > 0,
      count: totalCommits,
      details: totalCommits > 0
        ? `${totalCommits} commit(s) pushed today on GitHub`
        : "No public commits found today on GitHub",
    };
  } catch {
    return { submitted: false, count: 0, details: "GitHub API request failed" };
  }
}

export async function verifyCoding(method: string, config: any, ctx: VerifyContext): Promise<VerifyResult> {
  switch (method) {
    case "codeforces": {
      const handle = config.handle || ctx.verificationConfig?.codeforces_handle;
      if (!handle) return { passed: false, method: "codeforces", score: 0, details: "No Codeforces handle configured" };
      const result = await verifyCodeforces(handle);
      return { passed: result.submitted, method: "codeforces", score: result.submitted ? 100 : 0, details: result.details };
    }
    case "leetcode": {
      const username = config.username || ctx.verificationConfig?.leetcode_username;
      if (!username) return { passed: false, method: "leetcode", score: 0, details: "No LeetCode username configured" };
      const result = await verifyLeetcode(username);
      return { passed: result.submitted, method: "leetcode", score: result.submitted ? 100 : 0, details: result.details };
    }
    case "github": {
      const username = config.username || ctx.verificationConfig?.github_username;
      if (!username) return { passed: false, method: "github", score: 0, details: "No GitHub username configured" };
      const result = await verifyGitHub(username);
      return { passed: result.submitted, method: "github", score: result.submitted ? 100 : 0, details: result.details };
    }
    default:
      return { passed: false, method, score: 0, details: "Unknown coding verification method" };
  }
}
