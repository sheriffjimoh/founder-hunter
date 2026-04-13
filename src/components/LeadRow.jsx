import { useState, useEffect } from "react";
import { PROFILES } from "../lib/profiles";
import StatusBadge from "./StatusBadge";
import SourceBadge from "./SourceBadge";

function CopyIcon({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} title="Copy email" style={{
      background: "none", border: "none", cursor: "pointer", padding: "0 2px",
      color: copied ? "#3fb950" : "#8b949e", fontSize: 12, lineHeight: 1,
      display: "inline-flex", alignItems: "center", verticalAlign: "middle",
    }}>
      {copied ? "✓" : "📋"}
    </button>
  );
}

export default function LeadRow({ lead, activeProfile, onUpdate, onSend, onGenerate, onFindEmail, isGenerating }) {
  const [expanded, setExpanded] = useState(false);
  const [editingDraft, setEditingDraft] = useState(false);
  const [draftText, setDraftText] = useState(lead.draft || "");
  const profile = PROFILES[activeProfile];
  const hasDraft = lead.draft != null && lead.draft !== "";

  // Sync local draftText when parent updates lead.draft (e.g. after generation)
  useEffect(() => {
    if (lead.draft) {
      setDraftText(lead.draft);
      setExpanded(true);
    }
  }, [lead.draft]);

  return (
    <div style={{
      background: "#0d1117", border: "1px solid #21262d",
      borderRadius: 10, marginBottom: 10, overflow: "hidden",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#30363d"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#21262d"}
    >
      {/* Row header */}
      <div style={{
        display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr auto",
        gap: 16, alignItems: "center", padding: "14px 20px", cursor: "pointer",
      }} onClick={() => setExpanded(!expanded)}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ color: "#e6edf3", fontWeight: 600, fontSize: 14 }}>{lead.company}</span>
            <SourceBadge source={lead.source} />
          </div>
          <div style={{ color: "#8b949e", fontSize: 12 }}>
            {lead.founder}{lead.email ? <> · {lead.email} <CopyIcon text={lead.email} /></> : ""}
            {!lead.email && lead.website && onFindEmail && (
              <button onClick={e => { e.stopPropagation(); onFindEmail(lead.id); }}
                style={{
                  background: "#f59e0b15", color: "#f59e0b", border: "1px solid #f59e0b40",
                  padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                  cursor: "pointer", fontFamily: "monospace", marginLeft: 6,
                }}>🔍 Find Email</button>
            )}
            {lead.emailConfidence > 0 && (
              <span style={{ color: "#3fb950", fontSize: 10, marginLeft: 6 }}>
                {lead.emailConfidence}% match
              </span>
            )}
          </div>
        </div>
        <div>
          <div style={{ color: "#8b949e", fontSize: 11, marginBottom: 2 }}>TRIGGER</div>
          <div style={{ color: "#c9d1d9", fontSize: 12, lineHeight: 1.4 }}>{lead.triggerNote}</div>
        </div>
        <div style={{ color: "#8b949e", fontSize: 12, lineHeight: 1.5 }}>
          {hasDraft
            ? <span style={{ color: "#c9d1d9" }}>{lead.draft.slice(0, 80)}…</span>
            : <span style={{ color: "#484f58", fontStyle: "italic" }}>No draft yet</span>}
        </div>
        <div><StatusBadge status={lead.status} /></div>
        <div style={{ display: "flex", gap: 8 }}>
          {!hasDraft && (
            <button onClick={e => { e.stopPropagation(); onGenerate(lead.id); }}
              disabled={isGenerating}
              style={{
                background: isGenerating ? "#1a1a1a" : `${profile.color}15`,
                color: isGenerating ? "#484f58" : profile.color,
                border: `1px solid ${isGenerating ? "#30363d" : profile.color + "50"}`,
                padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: isGenerating ? "not-allowed" : "pointer", fontFamily: "monospace",
                transition: "all 0.2s",
              }}>
              {isGenerating ? "⟳ Writing…" : "⚡ Draft"}
            </button>
          )}
          {hasDraft && lead.status !== "Sent" && (
            <button onClick={e => { e.stopPropagation(); onSend(lead); }}
              style={{
                background: "#0a1e12", color: "#00ff9d",
                border: "1px solid #00ff9d50",
                padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "monospace",
              }}>✉ Send</button>
          )}
          <span style={{ color: "#484f58", fontSize: 16, userSelect: "none" }}>
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ borderTop: "1px solid #21262d", padding: "16px 20px", background: "#090d13" }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#8b949e", fontSize: 11, marginBottom: 6, fontFamily: "monospace", letterSpacing: "0.08em" }}>COMPANY PITCH</div>
            <div style={{ color: "#c9d1d9", fontSize: 13, lineHeight: 1.6 }}>{lead.pitch}</div>
            <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
              {lead.website && (
                <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: "#58a6ff", fontSize: 12, textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                >🌐 {lead.website.replace(/^https?:\/\//, "")}</a>
              )}
              {lead.ycUrl && (
                <a href={lead.ycUrl}
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: "#f59e0b", fontSize: 12, textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                >YC Page ↗</a>
              )}
            </div>
          </div>
          {hasDraft && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ color: "#8b949e", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em" }}>
                  AI DRAFT · Profile: <span style={{ color: profile.color }}>{lead.profile?.toUpperCase() || activeProfile.toUpperCase()}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setDraftText(lead.draft); setEditingDraft(!editingDraft); }}
                    style={{
                      background: "transparent", color: "#8b949e", border: "1px solid #30363d",
                      padding: "4px 10px", borderRadius: 5, fontSize: 11, cursor: "pointer",
                    }}>{editingDraft ? "Cancel" : "✎ Edit"}</button>
                  {editingDraft && (
                    <button onClick={() => { onUpdate(lead.id, draftText); setEditingDraft(false); }}
                      style={{
                        background: "#0a1e12", color: "#00ff9d", border: "1px solid #00ff9d50",
                        padding: "4px 10px", borderRadius: 5, fontSize: 11, cursor: "pointer",
                      }}>Save</button>
                  )}
                  <button onClick={() => onGenerate(lead.id)} disabled={isGenerating}
                    style={{
                      background: "transparent", color: "#818cf8", border: "1px solid #818cf830",
                      padding: "4px 10px", borderRadius: 5, fontSize: 11, cursor: isGenerating ? "not-allowed" : "pointer",
                    }}>↻ Regen</button>
                </div>
              </div>
              {editingDraft ? (
                <textarea value={draftText} onChange={e => setDraftText(e.target.value)}
                  style={{
                    width: "100%", minHeight: 160, background: "#0d1117",
                    border: "1px solid #30363d", borderRadius: 6, color: "#e6edf3",
                    padding: 12, fontSize: 13, lineHeight: 1.7, fontFamily: "'Georgia', serif",
                    resize: "vertical", outline: "none", boxSizing: "border-box",
                  }} />
              ) : (
                <div style={{ position: "relative" }}>
                  <div style={{
                    background: "#0d1117", border: "1px solid #21262d", borderRadius: 6,
                    padding: "14px 16px", color: "#e6edf3", fontSize: 13, lineHeight: 1.75,
                    fontFamily: "'Georgia', serif", whiteSpace: "pre-wrap",
                  }}>{lead.draft}</div>
                  <span style={{ position: "absolute", top: 8, right: 8 }}>
                    <CopyIcon text={lead.draft} />
                  </span>
                </div>
              )}
              {lead.subject && (
                <div style={{ marginTop: 8, color: "#8b949e", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                  Subject: <span style={{ color: "#c9d1d9" }}>{lead.subject}</span>
                  <CopyIcon text={lead.subject} />
                </div>
              )}
            </div>
          )}
          {!hasDraft && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <button onClick={() => onGenerate(lead.id)} disabled={isGenerating}
                style={{
                  background: `${profile.color}15`, color: profile.color,
                  border: `1px solid ${profile.color}50`,
                  padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: isGenerating ? "not-allowed" : "pointer", fontFamily: "monospace",
                }}>
                {isGenerating ? "⟳ Generating draft…" : `⚡ Generate Draft as ${profile.label}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
