/**
 * LINK CARD COMPONENT
 * 
 * Displays a summary of a monitored URL on the dashboard.
 * Includes status badges, last-checked relative time, and action buttons (Check, View, Delete).
 */

"use client";

import React from "react";

interface LinkCardProps {
    id: string;
    url: string;
    label: string | null;
    lastChecked: string | null;
    latestCheck: {
        hasChanges: boolean;
        summary: string | null;
        checkedAt: string;
        error: string | null;
        snippet: string | null;
    } | null;
    isChecking: boolean;
    onCheckNow: (id: string) => void;
    onDelete: (id: string) => void;
}

/**
 * Helper to format a date into a human-readable relative time string.
 */
function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Logic to determine the badge text and style based on the latest check status.
 */
function getStatusBadge(
    latestCheck: LinkCardProps["latestCheck"]
): { text: string; className: string } {
    if (!latestCheck) return { text: "Never Checked", className: "badge badge-never" };
    if (latestCheck.error) return { text: "Error", className: "badge badge-error" };
    if (latestCheck.hasChanges) return { text: "Changed", className: "badge badge-changed" };
    return { text: "No Changes", className: "badge badge-no-change" };
}

export default function LinkCard({
    id,
    url,
    label,
    lastChecked,
    latestCheck,
    isChecking,
    onCheckNow,
    onDelete,
}: LinkCardProps) {
    const badge = getStatusBadge(latestCheck);

    return (
        <div
            className="card"
            style={{
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
            }}
        >
            {/* Status + Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "6px",
                    }}
                >
                    <a
                        href={`/monitor/${id}`}
                        style={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {label || url}
                    </a>
                    <span className={badge.className}>{badge.text}</span>
                </div>
                <div
                    className="mono"
                    style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {url}
                </div>
                {lastChecked && (
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginTop: "4px",
                        }}
                    >
                        Checked {timeAgo(lastChecked)}
                    </div>
                )}
                {latestCheck?.error && (
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "var(--badge-error)",
                            marginTop: "4px",
                        }}
                    >
                        {latestCheck.error}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onCheckNow(id)}
                    disabled={isChecking}
                >
                    {isChecking ? (
                        <>
                            <span className="spinner" /> Checking…
                        </>
                    ) : (
                        "Check Now"
                    )}
                </button>
                <a href={`/monitor/${id}`} className="btn btn-secondary btn-sm">
                    View
                </a>
                <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(id)}
                    disabled={isChecking}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
