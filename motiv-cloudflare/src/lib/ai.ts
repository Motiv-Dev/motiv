import OpenAI from "openai";
import { downloadFromR2 } from "@/lib/r2";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

interface AIVerificationResult {
  confidence: number; // 0-100
  description: string;
  flags: string[];
}

/**
 * Analyze a proof photo using OpenAI Vision API.
 * Reads the photo from R2 instead of the local filesystem.
 */
export async function analyzeProofPhoto(
  photoPath: string,
  habitType: string,
  keyword: string
): Promise<AIVerificationResult> {
  if (!openai) {
    return {
      confidence: -1,
      description: "AI verification unavailable (no API key)",
      flags: [],
    };
  }

  const habitDescriptions: Record<string, string> = {
    gym: "person at a gym, working out, using exercise equipment, or in a fitness center",
    study: "person studying, reading books, at a desk with notes/laptop, in a library",
    wake_up: "person awake early morning, morning routine, sunrise, alarm clock",
    meditation: "person meditating, sitting peacefully, mindfulness practice",
    running: "person running, jogging outdoors, on a track, in athletic wear",
    reading: "person reading a book, at a library, holding reading material",
    coding: "person coding, laptop with code on screen, programming environment",
    no_junk_food: "healthy food, clean eating, meal prep, no fast food",
  };

  const expectedScene = habitDescriptions[habitType] || `person performing ${habitType} activity`;

  try {
    // Read the photo from R2
    // photoPath is like /uploads/proofs/photo-uuid.jpg — strip the leading /uploads/
    const r2Key = photoPath.startsWith("/uploads/") ? photoPath.slice(9) : photoPath;
    const r2Object = await downloadFromR2(r2Key);

    if (!r2Object) {
      return {
        confidence: -1,
        description: "Photo not found in storage",
        flags: ["file_not_found"],
      };
    }

    const buffer = await r2Object.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const mimeType = photoPath.endsWith(".png") ? "image/png" : "image/jpeg";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: `You are a proof verification AI for a habit-tracking app called Motiv. Users stake real money on completing daily habits. Your job is to verify if the submitted photo genuinely shows proof of completing the habit. Be strict but fair. Look for signs of deception like screenshots of screenshots, stock photos, or AI-generated images.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Verify this proof photo for the habit: "${habitType}".
Expected scene: ${expectedScene}.
The user should have the keyword "${keyword}" visible or spoken in a video.

Respond in JSON format:
{
  "confidence": <0-100 how confident this is genuine proof>,
  "description": "<what you see in the image>",
  "flags": ["<any concerns>"]
}

Score guidelines:
- 80-100: Clearly shows the expected activity, looks genuine
- 50-79: Somewhat related but not conclusive
- 20-49: Questionable, might not be genuine
- 0-19: Clearly fake, unrelated, or deceptive`,
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "";

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        confidence: Math.min(100, Math.max(0, parsed.confidence || 0)),
        description: parsed.description || "Unable to analyze",
        flags: parsed.flags || [],
      };
    }

    return { confidence: 50, description: content, flags: ["Could not parse AI response"] };
  } catch (error: any) {
    console.error("AI verification error:", error.message);
    return {
      confidence: -1,
      description: `AI analysis failed: ${error.message}`,
      flags: ["ai_error"],
    };
  }
}

/**
 * Generate a motivational message based on the user's streak and habit.
 */
export async function generateMotivation(
  streak: number,
  habitType: string,
  userName: string
): Promise<string> {
  const fallbacks: Record<string, string[]> = {
    low: [
      "Day 1 is the hardest. You showed up. That's everything.",
      "The only bad workout is the one that didn't happen. You did it.",
      "Your future self will thank you for starting today.",
    ],
    mid: [
      `${streak} days strong. You're building something most people only talk about.`,
      "Discipline is choosing between what you want now and what you want most.",
      `${streak}-day streak. Your excuses are losing this fight.`,
    ],
    high: [
      `${streak} days. You're not the same person who started. This is transformation.`,
      "At this point, the habit isn't what you do — it's who you are.",
      `${streak} days of relentless execution. Legends are built like this.`,
    ],
    legendary: [
      `${streak} DAYS. You are statistically in the top 1% of discipline.`,
      "You've proven that stakes + willpower = unstoppable. You're a Motiv legend.",
      `${streak} days. Write a book. You've earned it.`,
    ],
  };

  const tier = streak <= 3 ? "low" : streak <= 14 ? "mid" : streak <= 30 ? "high" : "legendary";
  const fallback = fallbacks[tier][Math.floor(Math.random() * fallbacks[tier].length)];

  if (!openai) return fallback;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 100,
      messages: [
        {
          role: "system",
          content: `You are the voice of Motiv — a brutally honest, hyper-motivational habit app where people stake real money. Your tone is intense, direct, no-BS. Like a mix of David Goggins and a disappointed Indian parent. Keep it to 1-2 sentences max. No emojis. No hashtags.`,
        },
        {
          role: "user",
          content: `${userName} just completed day ${streak} of their ${habitType.replace("_", " ")} streak. Give them a motivational message.`,
        },
      ],
    });

    return response.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}
