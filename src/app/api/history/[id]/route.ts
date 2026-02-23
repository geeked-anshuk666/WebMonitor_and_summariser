import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/history/[id] — Return last 5 checks for a link, newest first.
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const link = await prisma.link.findUnique({ where: { id } });
        if (!link) {
            return NextResponse.json(
                { success: false, error: "Link not found" },
                { status: 404 }
            );
        }

        const checks = await prisma.check.findMany({
            where: { linkId: id },
            orderBy: { checkedAt: "desc" },
            take: 5,
            select: {
                id: true,
                checkedAt: true,
                hasChanges: true,
                summary: true,
                diff: true,
                snippet: true,
                error: true,
                contentHash: true,
            },
        });

        return NextResponse.json({ success: true, data: checks });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("GET /api/history/[id] error:", err.message);
        return NextResponse.json(
            { success: false, error: "Failed to fetch history" },
            { status: 500 }
        );
    }
}
