/**
 * API: /api/check
 * 
 * The core orchestration endpoint for running webpage checks.
 * This route triggers the fetch -> diff -> summarize -> notify pipeline.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchPageText } from "@/lib/fetcher";
import { computeHash, computeDiff, extractSnippet } from "@/lib/differ";
import { summarizeChanges } from "@/lib/summarize";

export const dynamic = "force-dynamic";

const MAX_CHECKS_PER_LINK = 5;

interface CheckResult {
    linkId: string;
    hasChanges: boolean;
    summary: string | null;
    diff: string | null;
    checkedAt: Date;
    error: string | null;
}

/**
 * Runs a check for a single link:
 * 1. Fetch page text
 * 2. Hash and compare with last check
 * 3. If changed: compute diff → LLM summarize
 * 4. Persist check record
 * 5. Prune old checks (keep latest 5)
 */
/**
 * Orchestrates the check for a single link.
 * 1. Fetch: Downloads latest page content safely (SSRF protection in fetcher)
 * 2. Hash: Compares content SHA256 with last check to detect changes
 * 3. Diff: Generates unified diff if hashes don't match
 * 4. AI: Calls OpenRouter for a high-precision summary of the diff
 * 5. Storage: Saves Check record and prunes old ones (max 5)
 */
async function runCheck(linkId: string): Promise<CheckResult> {
    const link = await prisma.link.findUnique({ where: { id: linkId } });
    if (!link) {
        throw new Error("Link not found");
    }

    try {
        // Step 1: Fetch page text
        const { text } = await fetchPageText(link.url);

        // Step 2: Hash and compare
        const newHash = computeHash(text);
        const lastCheck = await prisma.check.findFirst({
            where: { linkId },
            orderBy: { checkedAt: "desc" },
        });

        let hasChanges = false;
        let diff: string | null = null;
        let summary: string | null = null;
        let snippet: string | null = null;

        if (lastCheck && lastCheck.contentHash !== newHash && lastCheck.rawText) {
            // Step 3: Content changed
            hasChanges = true;
            const diffResult = computeDiff(lastCheck.rawText, text);
            diff = diffResult.unified;
            snippet = extractSnippet(diff);

            // Step 4: LLM summarization
            try {
                summary = await summarizeChanges(diff, link.url);
            } catch {
                summary = "AI summary unavailable — check status page or verify OPENROUTER_API_KEY";
            }
        } else if (!lastCheck) {
            // First check — no diff possible, store as baseline
            summary = "First snapshot captured — changes will be tracked from this point.";
        }

        // Step 5: Persist check record
        const check = await prisma.check.create({
            data: {
                linkId,
                contentHash: newHash,
                rawText: text,
                diff,
                summary,
                hasChanges,
                snippet,
            },
        });

        // Update link's last checked time
        await prisma.link.update({
            where: { id: linkId },
            data: { lastChecked: check.checkedAt },
        });

        // Step 6: Prune old checks (keep latest MAX_CHECKS_PER_LINK)
        const allChecks = await prisma.check.findMany({
            where: { linkId },
            orderBy: { checkedAt: "desc" },
            select: { id: true },
        });

        if (allChecks.length > MAX_CHECKS_PER_LINK) {
            const idsToDelete = allChecks
                .slice(MAX_CHECKS_PER_LINK)
                .map((c: { id: string }) => c.id);
            await prisma.check.deleteMany({
                where: { id: { in: idsToDelete } },
            });
        }

        return {
            linkId,
            hasChanges,
            summary,
            diff,
            checkedAt: check.checkedAt,
            error: null,
        };
    } catch (error: unknown) {
        const err = error as Error;

        // Save an error check record
        const check = await prisma.check.create({
            data: {
                linkId,
                contentHash: "",
                hasChanges: false,
                error: err.message,
            },
        });

        await prisma.link.update({
            where: { id: linkId },
            data: { lastChecked: check.checkedAt },
        });

        return {
            linkId,
            hasChanges: false,
            summary: null,
            diff: null,
            checkedAt: check.checkedAt,
            error: err.message,
        };
    }
}

/**
 * POST /api/check
 * 
 * Supports two modes:
 * - Single: Pass { linkId: '...' } to check one specific URL.
 * - Bulk: Call with empty body to check all monitored links.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { linkId } = body as { linkId?: string };

        if (linkId) {
            // Check single link
            const result = await runCheck(linkId);
            return NextResponse.json({ success: true, data: result });
        }

        // Check all links
        const links = await prisma.link.findMany({ select: { id: true } });
        const results: CheckResult[] = [];

        for (const link of links) {
            const result = await runCheck(link.id);
            results.push(result);
        }

        return NextResponse.json({ success: true, data: results });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("POST /api/check error:", err.message);
        return NextResponse.json(
            { success: false, error: err.message || "Check failed" },
            { status: 500 }
        );
    }
}
