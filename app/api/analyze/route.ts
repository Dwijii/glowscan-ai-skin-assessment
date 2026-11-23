import { NextRequest, NextResponse } from "next/server";
import { buildAnalysisPrompt } from "@/lib/prompt";
import { checkRateLimit } from "@/lib/rateLimit";

// Server-side proxy: the browser sends only the image; the API key, model and
// prompt never leave the server.

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BASE64_CHARS = 7_000_000; // ~5 MB image

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many scans. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  let body: { image?: string; mediaType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { image, mediaType } = body;
  if (!image || !mediaType || !ALLOWED_TYPES.has(mediaType) || image.length > MAX_BASE64_CHARS) {
    return NextResponse.json({ error: "Please upload a JPEG, PNG or WebP photo under 5 MB." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Server not configured." }, { status: 500 });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: buildAnalysisPrompt(process.env.NEXT_PUBLIC_CLINIC_NAME ?? "Lumen Aesthetics") },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("Anthropic API error", res.status, await res.text());
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 502 });
  }

  const data = await res.json();
  const text: string = (data.content ?? []).map((c: { text?: string }) => c.text ?? "").join("");
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Could not read the analysis. Try a clearer, well-lit photo." }, { status: 502 });
  }
}
