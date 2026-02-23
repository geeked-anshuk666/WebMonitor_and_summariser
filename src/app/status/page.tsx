"use client";

import React, { useState, useEffect, useCallback } from "react";
import StatusIndicator from "@/components/StatusIndicator";

interface StatusData {
    backend: { ok: boolean; latencyMs: number; error?: string };
    database: { ok: boolean; latencyMs: number; error?: string };
    llm: { ok: boolean; latencyMs: number; error?: string };
}

export default function StatusPage() {
    const [status, setStatus] = useState<StatusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const fetchStatus = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/status");
            const data = await res.json();
            if (data.success) {
                setStatus(data.data);
                setLastChecked(new Date());
            }
        } catch {
            setStatus({
                backend: { ok: false, latencyMs: 0, error: "Cannot reach server" },
                database: { ok: false, latencyMs: 0, error: "Cannot reach server" },
                llm: { ok: false, latencyMs: 0, error: "Cannot reach server" },
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                }}
            >
                <div>
                    <h1 style={{ fontSize: "1.5rem", margin: 0 }}>System Status</h1>
                    {lastChecked && (
                        <p
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "0.8rem",
                                margin: "4px 0 0",
                            }}
                        >
                            Last checked: {lastChecked.toLocaleTimeString()} · Auto-refreshes every 30s
                        </p>
                    )}
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={fetchStatus}
                    disabled={loading}
                >
                    {loading ? <span className="spinner" /> : "Refresh"}
                </button>
            </div>

            {status ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <StatusIndicator
                        name="Backend"
                        ok={status.backend.ok}
                        latencyMs={status.backend.latencyMs}
                        error={status.backend.error}
                    />
                    <StatusIndicator
                        name="Database"
                        ok={status.database.ok}
                        latencyMs={status.database.latencyMs}
                        error={status.database.error}
                    />
                    <StatusIndicator
                        name="LLM (OpenRouter)"
                        ok={status.llm.ok}
                        latencyMs={status.llm.latencyMs}
                        error={status.llm.error}
                    />
                </div>
            ) : (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div className="spinner" style={{ width: "28px", height: "28px" }} />
                </div>
            )}
        </div>
    );
}
