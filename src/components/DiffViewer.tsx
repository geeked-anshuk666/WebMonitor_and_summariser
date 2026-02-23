"use client";

import React from "react";

interface DiffViewerProps {
    diff: string | null;
}

export default function DiffViewer({ diff }: DiffViewerProps) {
    if (!diff) {
        return (
            <div className="card" style={{ padding: "24px", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)" }}>No diff to show</p>
            </div>
        );
    }

    const lines = diff.split("\n");

    const handleCopy = () => {
        navigator.clipboard.writeText(diff);
    };

    return (
        <div className="card" style={{ overflow: "hidden" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                <span
                    style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        fontWeight: 500,
                    }}
                >
                    Unified Diff
                </span>
                <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                    Copy Diff
                </button>
            </div>
            <div style={{ overflowX: "auto", maxHeight: "500px", overflowY: "auto" }}>
                {lines.map((line, i) => {
                    let className = "diff-line diff-context";
                    if (line.startsWith("@@")) {
                        className = "diff-line diff-header";
                    } else if (line.startsWith("+") && !line.startsWith("+++")) {
                        className = "diff-line diff-add";
                    } else if (line.startsWith("-") && !line.startsWith("---")) {
                        className = "diff-line diff-remove";
                    }

                    return (
                        <div key={i} className={className}>
                            {line}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
