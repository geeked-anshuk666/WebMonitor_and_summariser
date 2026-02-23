/**
 * AI SUMMARIZATION SERVICE
 * 
 * Interfaces with OpenRouter to generate concise, human-readable summaries of diffs.
 * Includes strict grounding rules, truncation, and reliable retry logic.
 */

import OpenAI from "openai";

/**
 * The System Prompt enforces high-precision grounding.
 * It forbids the AI from hallucinating design styles or file structures
 * not present in the text diff.
 */
const SYSTEM_PROMPT = `You are a high-precision webpage change analyst. 
Your task is to summarize the changes in a provided unified diff.

RULES:
1. ONLY summarize what is explicitly added (+) or removed (-) in the text.
2. DO NOT mention design, layout, or "glassmorphism" unless the text explicitly says "style changed to glassmorphism".
3. AVOID hallucinations about file names or directory structures unless they appear as specific text changes in the diff.
4. If the diff shows technical metadata (like SEO tags), describe them as "metadata updates" rather than assuming their intent.
5. Be concise: 2-4 sentences.
6. Use plain, professional language.`;

const MAX_DIFF_CHARS = 24000; // ~8k tokens at ~3 chars/token
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Creates an OpenAI client pointed at OpenRouter's API.
 */
function getClient(): OpenAI {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error(
            "OPENROUTER_API_KEY is not set — configure it in .env to enable AI summaries"
        );
    }

    return new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
            "HTTP-Referer": "https://web-monitor.onrender.com",
            "X-Title": "Web Monitor",
        },
    });
}

/**
 * Truncates a diff string to fit within the token budget.
 * Preserves the beginning and end of the diff for context.
 */
function truncateDiff(diff: string): string {
    if (diff.length <= MAX_DIFF_CHARS) return diff;

    const halfMax = Math.floor(MAX_DIFF_CHARS / 2);
    const start = diff.slice(0, halfMax);
    const end = diff.slice(-halfMax);

    return `${start}\n\n... [diff truncated — ${diff.length - MAX_DIFF_CHARS} characters omitted] ...\n\n${end}`;
}

/**
 * Summarizes a diff using the OpenRouter LLM.
 * Retries up to 3 times with exponential backoff on failure.
 * 
 * 1. Checks for API key
 * 2. Truncates diff to fit context window
 * 3. Sends high-precision prompt to OpenRouter
 * 4. Normalizes output
 */
export async function summarizeChanges(
    diff: string,
    url: string
): Promise<string> {
    const client = getClient();
    const truncatedDiff = truncateDiff(diff);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await client.chat.completions.create({
                model: "openrouter/free",


                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    {
                        role: "user",
                        content: `URL: ${url}\n\nDiff:\n${truncatedDiff}`,
                    },
                ],
                temperature: 0.3,
                max_tokens: 300,
            });

            const content = response.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error("LLM returned empty response");
            }

            return content.trim();
        } catch (error: unknown) {
            const isLastAttempt = attempt === MAX_RETRIES;
            const err = error as Error & { status?: number };

            // Don't retry on config errors
            if (err.message?.includes("OPENROUTER_API_KEY")) {
                throw err;
            }

            if (isLastAttempt) {
                console.error(`LLM summarization failed after ${MAX_RETRIES} attempts:`, err.message);
                return "AI summary unavailable — check status page or verify OPENROUTER_API_KEY";
            }

            // Exponential backoff
            const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
            console.warn(`LLM attempt ${attempt} failed, retrying in ${delay}ms:`, err.message);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    return "AI summary unavailable";
}

/**
 * Quick health check — sends a minimal request to OpenRouter.
 * Returns the latency in ms, or throws on failure.
 */
export async function checkLlmHealth(): Promise<number> {
    const start = Date.now();
    const client = getClient();

    await client.chat.completions.create({
        model: "openrouter/free",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 1,
    });

    return Date.now() - start;
}
