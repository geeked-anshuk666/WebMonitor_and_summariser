/**
 * STATUS INDICATOR COMPONENT
 * 
 * Renders a service health card with a pulse animation and latency info.
 * Used on the Status Page for Backend, Database, and LLM monitoring.
 */

"use client";

import React from "react";

interface StatusIndicatorProps {
    name: string;
    ok: boolean;
    latencyMs: number;
    error?: string;
}

export default function StatusIndicator({
    name,
    ok,
    latencyMs,
    error,
}: StatusIndicatorProps) {
    return (
        <div
            className="card"
            style={{
                padding: "24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
            }}
        >
            {/* Animated pulse dot (green for healthy, red for down) */}
            <div
                className={`pulse-dot ${ok ? "pulse-dot-green" : "pulse-dot-red"}`}
            />
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        marginBottom: "4px",
                    }}
                >
                    {name}
                </div>
                {ok ? (
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        OK — {latencyMs}ms
                    </div>
                ) : (
                    <div style={{ fontSize: "0.8rem", color: "var(--badge-error)" }}>
                        {error || "Unavailable"}
                    </div>
                )}
            </div>
            <div
                style={{
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: ok ? "var(--success)" : "var(--danger)",
                }}
            >
                {ok ? "Healthy" : "Down"}
            </div>
        </div>
    );
}
