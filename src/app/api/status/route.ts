/**
 * API: /api/status
 * 
 * Aggregated health check endpoint for the entire system.
 * Benchmarks latency for the database and the OpenRouter AI connection.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkLlmHealth } from "@/lib/summarize";

export const dynamic = "force-dynamic";

/**
 * GET /api/status — Health check for backend, database, and LLM services.
 */
export async function GET() {
    const result = {
        backend: { ok: true, latencyMs: 0 },
        database: { ok: false as boolean, latencyMs: 0, error: undefined as string | undefined },
        llm: { ok: false as boolean, latencyMs: 0, error: undefined as string | undefined },
    };

    // Backend — always OK if this endpoint responds
    result.backend = { ok: true, latencyMs: 0 };

    // Database health
    try {
        const dbStart = Date.now();
        await prisma.link.count();
        result.database = { ok: true, latencyMs: Date.now() - dbStart, error: undefined };
    } catch (error: unknown) {
        const err = error as Error;
        result.database = { ok: false, latencyMs: 0, error: err.message };
    }

    // LLM health
    try {
        const latencyMs = await checkLlmHealth();
        result.llm = { ok: true, latencyMs, error: undefined };
    } catch (error: unknown) {
        const err = error as Error;
        result.llm = { ok: false, latencyMs: 0, error: err.message };
    }

    return NextResponse.json({ success: true, data: result });
}
