import type { VerifyResult, VerifyContext } from "./index";

export async function verifyScreentime(method: string, config: any, ctx: VerifyContext): Promise<VerifyResult> {
  // Screen time verification relies on AI analysis of the uploaded screenshot
  // The existing /api/verify endpoint handles AI vision analysis
  // Here we just validate that a screenshot was uploaded
  if (!ctx.photoUrl) {
    return {
      passed: false,
      method: "screentime_check",
      score: 0,
      details: "No screen time screenshot uploaded",
    };
  }

  // If we have a max_hours config, the AI verify endpoint will check against it
  // For now, mark as requiring manual/AI review
  return {
    passed: false,
    method: "screentime_check",
    score: 50, // Partial — needs AI analysis
    details: `Screenshot uploaded, pending AI analysis (target: max ${config.max_hours || "?"} hours/day)`,
  };
}
