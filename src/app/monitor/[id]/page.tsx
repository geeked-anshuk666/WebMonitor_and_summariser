/**
 * MONITOR DETAIL PAGE
 * 
 * Dynamic route to view detailed check history and latest diffs for a specific URL.
 * Features:
 * - Tabbed view: Latest Changes vs. Full History
 * - AI Summary display
 * - Unified Diff viewer
 * - JSON Export functionality
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import SummaryCard from "@/components/SummaryCard";
import DiffViewer from "@/components/DiffViewer";

interface CheckData {
    id: string;
    checkedAt: string;
    hasChanges: boolean;
    summary: string | null;
    diff: string | null;
    snippet: string | null;
    error: string | null;
}

interface LinkData {
    id: string;
    url: string;
    label: string | null;
    lastChecked: string | null;
}

export default function MonitorPage() {
    const params = useParams();
    const id = params.id as string;

    const [link, setLink] = useState<LinkData | null>(null);
    const [checks, setChecks] = useState<CheckData[]>([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [activeTab, setActiveTab] = useState<"latest" | "history">("latest");
    const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [linksRes, historyRes] = await Promise.all([
                fetch("/api/links"),
                fetch(`/api/history/${id}`),
            ]);
            const linksData = await linksRes.json();
            const historyData = await historyRes.json();

            if (linksData.success) {
                const found = linksData.data.find((l: LinkData) => l.id === id);
                setLink(found || null);
            }
            if (historyData.success) {
                setChecks(historyData.data);
            }
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCheckNow = async () => {
        setChecking(true);
        try {
            await fetch("/api/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ linkId: id }),
            });
            fetchData();
        } catch {
            // silent
        } finally {
            setChecking(false);
        }
    };

    /**
     * Downloads the current monitor data and history as a JSON file.
     */
    const handleExportJson = () => {
        const blob = new Blob([JSON.stringify({ link, checks }, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `webmonitor-${id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div className="spinner" style={{ width: "28px", height: "28px" }} />
            </div>
        );
    }

    if (!link) {
        return (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                <h2>Link not found</h2>
                <a href="/" className="btn btn-secondary" style={{ marginTop: "16px", display: "inline-flex" }}>
                    ← Back to Dashboard
                </a>
            </div>
        );
    }

    const latestCheck = checks[0] || null;

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString();
    };

    return (
        <div>
            {/* Breadcrumb */}
            <div
                style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginBottom: "20px",
                }}
            >
                <a href="/">Home</a>
                <span style={{ margin: "0 8px" }}>›</span>
                <span style={{ color: "var(--text-secondary)" }}>{link.label || "Monitor"}</span>
            </div>

            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "24px",
                    gap: "16px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h1 style={{ fontSize: "1.4rem", margin: "0 0 6px" }}>
                        {link.label || "Untitled Link"}
                    </h1>
                    <div
                        className="mono"
                        style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                    >
                        {link.url}
                    </div>
                    {link.lastChecked && (
                        <div
                            style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}
                        >
                            Last checked: {formatDate(link.lastChecked)}
                        </div>
                    )}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleCheckNow}
                        disabled={checking}
                    >
                        {checking ? (
                            <>
                                <span className="spinner" /> Checking…
                            </>
                        ) : (
                            "Check Now"
                        )}
                    </button>
                    <button className="btn btn-secondary" onClick={handleExportJson}>
                        Export JSON
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div
                style={{
                    display: "flex",
                    gap: "0",
                    marginBottom: "20px",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                {(["latest", "history"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: "none",
                            border: "none",
                            borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                            padding: "10px 20px",
                            color:
                                activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                            fontWeight: activeTab === tab ? 600 : 400,
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            transition: "all 0.15s ease",
                        }}
                    >
                        {tab === "latest" ? "Latest Changes" : "History"}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "latest" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {latestCheck ? (
                        <>
                            <SummaryCard
                                summary={latestCheck.summary}
                                hasChanges={latestCheck.hasChanges}
                            />
                            {latestCheck.error && (
                                <div
                                    className="card"
                                    style={{
                                        padding: "16px",
                                        color: "var(--badge-error)",
                                        borderColor: "rgba(239, 68, 68, 0.3)",
                                    }}
                                >
                                    Error: {latestCheck.error}
                                </div>
                            )}
                            <DiffViewer diff={latestCheck.diff} />
                        </>
                    ) : (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "60px 20px",
                                color: "var(--text-muted)",
                            }}
                        >
                            <p>Click &quot;Check Now&quot; to take your first snapshot</p>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {checks.length === 0 ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "60px 20px",
                                color: "var(--text-muted)",
                            }}
                        >
                            <p>No checks yet — run your first check to start building history</p>
                        </div>
                    ) : (
                        checks.map((check) => (
                            <div key={check.id} className="card" style={{ overflow: "hidden" }}>
                                <button
                                    onClick={() =>
                                        setExpandedCheck(
                                            expandedCheck === check.id ? null : check.id
                                        )
                                    }
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "14px 18px",
                                        background: "none",
                                        border: "none",
                                        color: "var(--text-primary)",
                                        cursor: "pointer",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                            {formatDate(check.checkedAt)}
                                        </span>
                                        {check.error ? (
                                            <span className="badge badge-error">Error</span>
                                        ) : check.hasChanges ? (
                                            <span className="badge badge-changed">Changed</span>
                                        ) : (
                                            <span className="badge badge-no-change">No Change</span>
                                        )}
                                    </div>
                                    <span
                                        style={{
                                            transform: expandedCheck === check.id ? "rotate(180deg)" : "none",
                                            transition: "transform 0.15s",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        ▾
                                    </span>
                                </button>
                                {expandedCheck === check.id && (
                                    <div
                                        style={{
                                            padding: "0 18px 18px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "12px",
                                        }}
                                    >
                                        {check.summary && (
                                            <SummaryCard summary={check.summary} hasChanges={check.hasChanges} />
                                        )}
                                        {check.error && (
                                            <div style={{ color: "var(--badge-error)", fontSize: "0.85rem" }}>
                                                Error: {check.error}
                                            </div>
                                        )}
                                        {check.diff && <DiffViewer diff={check.diff} />}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
