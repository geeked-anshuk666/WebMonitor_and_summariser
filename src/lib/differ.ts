/**
 * DIFF ENGINE
 * 
 * Provides utilities for comparing two versions of page text.
 * Uses SHA256 for quick equality checks and "diff" package for unified patch generation.
 */

import { createHash } from "crypto";
import { createPatch } from "diff";

export interface DiffResult {
    unified: string;
    added: number;
    removed: number;
    hasChanges: boolean;
}

/**
 * Computes a SHA256 hash of the given text.
 */
export function computeHash(text: string): string {
    return createHash("sha256").update(text, "utf-8").digest("hex");
}

/**
 * Computes a unified diff between old and new text.
 * Returns the diff string + stats (added/removed line counts).
 * 
 * Used to show structural changes in the UI and as input for the LLM.
 */
export function computeDiff(oldText: string, newText: string): DiffResult {
    const unified = createPatch("content", oldText, newText, "previous", "current", {
        context: 3,
    });

    let added = 0;
    let removed = 0;
    const lines = unified.split("\n");

    for (const line of lines) {
        if (line.startsWith("+") && !line.startsWith("+++")) {
            added++;
        } else if (line.startsWith("-") && !line.startsWith("---")) {
            removed++;
        }
    }

    const hasChanges = added > 0 || removed > 0;

    return { unified, added, removed, hasChanges };
}

/**
 * Generates a short snippet (first ~200 chars) from the diff showing what changed.
 * This is used for quick previews in the dashboard list view.
 */
export function extractSnippet(diff: string, maxLength: number = 200): string {
    const lines = diff.split("\n");
    const changedLines: string[] = [];

    for (const line of lines) {
        if (
            (line.startsWith("+") && !line.startsWith("+++")) ||
            (line.startsWith("-") && !line.startsWith("---"))
        ) {
            changedLines.push(line);
        }
        if (changedLines.join(" ").length > maxLength) break;
    }

    const snippet = changedLines.join(" ").slice(0, maxLength);
    return snippet.length === maxLength ? snippet + "..." : snippet;
}
