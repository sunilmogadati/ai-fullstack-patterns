// AnthropicBedrock SDK wrapper.
//
// Single point where the LLM call happens. Centralized for three reasons:
//   1. One place to inject token-usage capture (cost tracking lives here).
//   2. One place to swap providers (Bedrock today; possibly add direct Anthropic
//      or AI Hub gateway later — see PDP §7.5.1 for the patterns).
//   3. One place to enforce timeout, retry, and the centralized error shape.
//
// Model routing by purpose, not by hardcoded choice:
//   - Cheap-fast work (summary, pattern extraction)  → Haiku
//   - Multi-criteria reasoning (priority ranking)    → Sonnet
//
// This mirrors PDP §6.8.3 (M2 — Model-tier selection): match model intensity
// to work intensity.

import { AnthropicBedrock } from "@anthropic-ai/bedrock-sdk";

// Lazy client init — the SDK reads AWS_REGION + standard credential providers
// (env, ~/.aws/credentials, AWS_PROFILE, IAM role). We do not pass them
// explicitly; the SDK chain is more flexible than any single mechanism.
let cachedClient = null;

function getClient() {
  if (cachedClient) return cachedClient;

  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error("AWS_REGION is not set. Copy .env.example to .env and fill it in.");
  }

  cachedClient = new AnthropicBedrock({
    awsRegion: region,
    // The SDK will use the default credential provider chain. To use a named
    // profile, set AWS_PROFILE in .env or in your shell.
  });
  return cachedClient;
}

// Model selection — read from env so changing models doesn't require code edits.
// Different AWS accounts have different Bedrock model access; the env file is
// the per-environment swap point.
export const MODELS = {
  haiku: process.env.BEDROCK_MODEL_HAIKU || "anthropic.claude-haiku-4-5-20251001-v1:0",
  sonnet: process.env.BEDROCK_MODEL_SONNET || "anthropic.claude-sonnet-4-5-20250929-v1:0",
};

/**
 * Call Claude via Bedrock and return the response text + usage metadata.
 *
 * @param {Object} options
 * @param {keyof typeof MODELS} options.tier — "haiku" (fast/cheap) or "sonnet" (reasoning)
 * @param {string} options.system — system prompt
 * @param {string} options.user — user message content
 * @param {number} [options.maxTokens=2048] — max output tokens
 * @param {number} [options.timeoutMs=45000] — request timeout
 * @returns {Promise<{ text: string, model: string, inputTokens: number, outputTokens: number }>}
 */
export async function callClaude({
  tier,
  system,
  user,
  maxTokens = 2048,
  timeoutMs = 45000,
}) {
  if (!MODELS[tier]) {
    const err = new Error(`unknown model tier: ${tier}`);
    err.status = 500;
    throw err;
  }

  const client = getClient();
  const model = MODELS[tier];

  // AbortController gives us a real timeout; without it the SDK can hang
  // on a slow connection past the user's patience.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const message = await client.messages.create(
      {
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      },
      { signal: controller.signal }
    );

    // The Bedrock SDK returns content as an array of content blocks.
    // For text-only responses (no tool use) there's exactly one TextBlock.
    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return {
      text,
      model,
      inputTokens: message.usage?.input_tokens ?? 0,
      outputTokens: message.usage?.output_tokens ?? 0,
    };
  } catch (err) {
    // Surface a clean error shape; the centralized errorHandler will pick it up.
    if (err.name === "AbortError") {
      const timeoutErr = new Error(`Claude call timed out after ${timeoutMs}ms`);
      timeoutErr.status = 504;
      throw timeoutErr;
    }
    // SDK errors typically have a useful message; wrap in our 502 since the
    // upstream is the failing dependency.
    const wrapErr = new Error(`Bedrock call failed: ${err.message || err}`);
    wrapErr.status = err.status || 502;
    wrapErr.cause = err;
    throw wrapErr;
  } finally {
    clearTimeout(timer);
  }
}
