"use client";

import React from "react";

interface SummaryCardProps {
    summary: string | null;
    hasChanges: boolean;
}

export default function SummaryCard({ summary, hasChanges }: SummaryCardProps) {
    if (!hasChanges && !summary) {
        return (
            <div
                className="card"
                style={{
                    padding: "20px",
                    borderLeft: "3px solid var(--badge-no-change)",
                }}
            >
                <div
                    style={{
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        color: "var(--text-muted)",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                    }}
                >
                    AI Summary
                </div>
                <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                    No changes detected
                </p>
            </div>
        );
    }

    return (
        <div
            className="card"
            style={{
                padding: "20px",
                borderLeft: `3px solid ${hasChanges ? "var(--accent)" : "var(--badge-no-change)"}`,
            }}
        >
            <div
                style={{
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "var(--accent)",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                }}
            >
                AI Summary
            </div>
            <p
                style={{
                    color: "var(--text-primary)",
                    margin: 0,
                    lineHeight: 1.6,
                    fontSize: "0.925rem",
                }}
            >
                {summary || "Summary not available"}
            </p>
        </div>
    );
}
