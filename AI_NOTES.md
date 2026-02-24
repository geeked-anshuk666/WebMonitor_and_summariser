# AI Usage Notes

## LLM Integration

This project uses **OpenRouter** with the **openrouter/free** router, which automatically selects the best available free model (e.g., Llama 3 or Gemma 2) for generating change summaries.

### How It Works

1. When a monitored page changes, a unified diff is computed between the old and new text
2. The diff is truncated to ~8,000 tokens (24,000 characters) if it exceeds the limit
3. The truncated diff is sent to the LLM with a constrained system prompt
4. The LLM generates a 2-4 sentence summary citing specific changes

### System Prompt

The LLM is constrained to:
- ONLY summarize what is explicitly added (+) or removed (-) in the text.
- DO NOT mention design, layout, or "glassmorphism" unless style is explicitly changed in the text.
- AVOID hallucinations about file names or directory structures.
- Describe technical metadata (like SEO tags) objectively as "metadata updates".
- Keep summaries to 2-4 sentences.

### Retry Logic

- Max 3 attempts with exponential backoff (1s, 2s, 4s)
- Config errors (missing API key) are not retried
- Failed summaries return a fallback message instead of throwing

### Token Budget

- Input is capped at ~8,000 tokens (~24,000 characters)
- Truncation preserves both the beginning and end of diffs
- Output is capped at 300 tokens

## AI-Assisted Development

This project was developed with AI assistance (Antigravity by Google DeepMind). The AI helped with:
- Code generation for all backend and frontend files
- TypeScript type resolution and Prisma 6 compatibility fixes

## Human Verification

The following items were checked and verified manually:
- **Architecture and System Design**: Architecture planning and implementation plan
- **Build and debugging**: Build verification and debugging
- **SSRF Protection**: Verified that internal IP ranges (127.0.0.1, 192.168.x.x) and non-HTTP protocols are correctly blocked.
- **Diff Accuracy**: Manually modified test pages to verify that the unified diff correctly reflects added and removed lines.
- **AI Grounding**: Verified that the LLM summaries strictly follow the system prompt and do not hallucinate layout changes.
- **Build & Docker**: Verified that the Docker container builds successfully and migrations run on startup via the `start.sh` script.
