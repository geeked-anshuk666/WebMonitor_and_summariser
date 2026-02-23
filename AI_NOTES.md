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
- Architecture planning and implementation plan
- Code generation for all backend and frontend files
- TypeScript type resolution and Prisma 6 compatibility fixes
- Build verification and debugging
