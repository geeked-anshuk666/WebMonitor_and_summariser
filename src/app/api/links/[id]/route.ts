import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/links/[id] — Remove a link and all its check history (cascade).
 */
export async function DELETE(
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

        await prisma.link.delete({ where: { id } });

        return NextResponse.json({ success: true, data: { id } });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("DELETE /api/links/[id] error:", err.message);
        return NextResponse.json(
            { success: false, error: "Failed to delete link" },
            { status: 500 }
        );
    }
}
