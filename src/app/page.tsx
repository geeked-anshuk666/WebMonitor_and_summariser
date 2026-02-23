"use client";

import React, { useState, useEffect, useCallback } from "react";
import LinkCard from "@/components/LinkCard";

interface LinkData {
  id: string;
  url: string;
  label: string | null;
  tags: string | null;
  lastChecked: string | null;
  latestCheck: {
    hasChanges: boolean;
    summary: string | null;
    checkedAt: string;
    error: string | null;
    snippet: string | null;
  } | null;
}

export default function HomePage() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set());
  const [checkingAll, setCheckingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form state
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [tags, setTags] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data.success) {
        setLinks(data.data);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to load links");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), label: label.trim(), tags: tags.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setUrl("");
        setLabel("");
        setTags("");
        showToast("Link added successfully", "success");
        fetchLinks();
      } else {
        setFormError(data.error);
      }
    } catch {
      setFormError("Failed to add link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckNow = async (linkId: string) => {
    setCheckingIds((prev) => new Set(prev).add(linkId));

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      });
      const data = await res.json();

      if (data.success) {
        const result = data.data;
        if (result.hasChanges) {
          showToast("Changes detected!", "success");
        } else if (result.error) {
          showToast(`Check failed: ${result.error}`, "error");
        } else {
          showToast("No changes detected", "success");
        }
        fetchLinks();
      } else {
        showToast(data.error || "Check failed", "error");
      }
    } catch {
      showToast("Check failed — network error", "error");
    } finally {
      setCheckingIds((prev) => {
        const next = new Set(prev);
        next.delete(linkId);
        return next;
      });
    }
  };

  const handleCheckAll = async () => {
    setCheckingAll(true);
    const allIds = new Set(links.map((l) => l.id));
    setCheckingIds(allIds);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.success) {
        const changed = data.data.filter((r: { hasChanges: boolean }) => r.hasChanges).length;
        showToast(
          changed > 0
            ? `Check complete — ${changed} link(s) changed`
            : "Check complete — no changes",
          "success"
        );
        fetchLinks();
      } else {
        showToast(data.error || "Check all failed", "error");
      }
    } catch {
      showToast("Check all failed — network error", "error");
    } finally {
      setCheckingAll(false);
      setCheckingIds(new Set());
    }
  };

  const handleDelete = async (linkId: string) => {
    try {
      const res = await fetch(`/api/links/${linkId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        showToast("Link removed", "success");
        fetchLinks();
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete — network error", "error");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div className="spinner" style={{ width: "28px", height: "28px" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: "4px 0 0" }}>
            Monitoring {links.length} link{links.length !== 1 ? "s" : ""}
          </p>
        </div>
        {links.length > 0 && (
          <button
            className="btn btn-secondary"
            onClick={handleCheckAll}
            disabled={checkingAll}
          >
            {checkingAll ? (
              <>
                <span className="spinner" /> Checking All…
              </>
            ) : (
              "Check All"
            )}
          </button>
        )}
      </div>

      {/* Add Link Form */}
      <form
        onSubmit={handleAddLink}
        className="card"
        style={{ padding: "20px", marginBottom: "24px" }}
      >
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "var(--text-muted)",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Add Link
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            className="input"
            style={{ flex: "2 1 250px" }}
            type="url"
            placeholder="https://example.com/pricing"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <input
            className="input"
            style={{ flex: "1 1 150px" }}
            type="text"
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            className="input hide-mobile"
            style={{ flex: "1 1 120px" }}
            type="text"
            placeholder="Tags (optional)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !url.trim()}
          >
            {submitting ? <span className="spinner" /> : "Add"}
          </button>
        </div>
        {formError && (
          <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "8px" }}>
            {formError}
          </div>
        )}
      </form>

      {error && (
        <div
          className="card"
          style={{
            padding: "16px",
            color: "var(--danger)",
            borderColor: "var(--danger)",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* Links List */}
      {links.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>◎</div>
          <h2 style={{ fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
            No links yet
          </h2>
          <p style={{ fontSize: "0.875rem" }}>
            Add your first link above to start monitoring for changes
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {links.map((link) => (
            <LinkCard
              key={link.id}
              id={link.id}
              url={link.url}
              label={link.label}
              lastChecked={link.lastChecked}
              latestCheck={link.latestCheck}
              isChecking={checkingIds.has(link.id)}
              onCheckNow={handleCheckNow}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="toast"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: 500,
            zIndex: 1000,
            background:
              toast.type === "success"
                ? "rgba(34, 197, 94, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            color:
              toast.type === "success" ? "var(--success)" : "var(--danger)",
            border: `1px solid ${toast.type === "success"
                ? "rgba(34, 197, 94, 0.3)"
                : "rgba(239, 68, 68, 0.3)"
              }`,
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
