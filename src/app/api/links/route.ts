import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateUrl } from "@/lib/fetcher";

export const dynamic = "force-dynamic";

const MAX_LINKS = 8;

/**
 * GET /api/links — Return all monitored links with their latest check status.
 */
export async function GET() {
    try {
        const links = await prisma.link.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                checks: {
                    orderBy: { checkedAt: "desc" },
                    take: 1,
                },
            },
        });

        const data = links.map((link: { id: string; url: string; label: string | null; tags: string | null; createdAt: Date; lastChecked: Date | null; checks: { hasChanges: boolean; summary: string | null; checkedAt: Date; error: string | null; snippet: string | null }[] }) => {
            const latestCheck = link.checks[0] || null;
            return {
                id: link.id,
                url: link.url,
                label: link.label,
                tags: link.tags,
                createdAt: link.createdAt,
                lastChecked: link.lastChecked,
                latestCheck: latestCheck
                    ? {
                        hasChanges: latestCheck.hasChanges,
                        summary: latestCheck.summary,
                        checkedAt: latestCheck.checkedAt,
                        error: latestCheck.error,
                        snippet: latestCheck.snippet,
                    }
                    : null,
            };
        });

        return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("GET /api/links error:", err.message);
        return NextResponse.json(
            { success: false, error: "Failed to fetch links" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/links — Add a new monitored link.
 * Body: { url: string, label?: string, tags?: string }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url, label, tags } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { success: false, error: "URL is required" },
                { status: 400 }
            );
        }

        // Validate URL format and safety
        try {
            validateUrl(url.trim());
        } catch (validationError: unknown) {
            const err = validationError as Error;
            return NextResponse.json(
                { success: false, error: err.message },
                { status: 400 }
            );
        }

        // Check for duplicate
        const existing = await prisma.link.findUnique({
            where: { url: url.trim() },
        });
        if (existing) {
            return NextResponse.json(
                { success: false, error: "You're already monitoring this URL" },
                { status: 409 }
            );
        }

        // Enforce max links
        const count = await prisma.link.count();
        if (count >= MAX_LINKS) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Maximum of ${MAX_LINKS} links reached. Delete one to add more.`,
                },
                { status: 400 }
            );
        }

        const link = await prisma.link.create({
            data: {
                url: url.trim(),
                label: label?.trim() || null,
                tags: tags?.trim() || null,
            },
        });

        return NextResponse.json({ success: true, data: link }, { status: 201 });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("POST /api/links error:", err.message);
        return NextResponse.json(
            { success: false, error: "Failed to add link" },
            { status: 500 }
        );
    }
}
