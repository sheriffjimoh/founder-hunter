import { useState, useEffect } from "react";
import { PROFILES } from "./lib/profiles";
import { SEED_LEADS } from "./lib/leads";
import { buildPrompt } from "./lib/prompts";
import { scanAllSources, SOURCES } from "./lib/sources";
import LeadRow from "./components/LeadRow";
import SettingsModal from "./components/SettingsModal";
import AddLeadModal from "./components/AddLeadModal";
import Toast from "./components/Toast";
import "./styles/global.css";


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function FounderHunter() {
  const [leads, setLeads] = useState(() => {
    try {
      const stored = localStorage.getItem("fh_leads");
      return stored ? JSON.parse(stored) : SEED_LEADS;
    } catch { return SEED_LEADS; }
  });
  const [activeProfile, setActiveProfile] = useState("individual");
  const [generatingId, setGeneratingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const apiKey = process.env.REACT_APP_ANTHROPIC_KEY || "";
  const [filter, setFilter] = useState("All");
  const [scanning, setScanning] = useState(false);
  const profile = PROFILES[activeProfile];

  // Persist leads to localStorage on every change
  useEffect(() => {
    localStorage.setItem("fh_leads", JSON.stringify(leads));
  }, [leads]);

  const showToast = (message, type = "success") => setToast({ message, type });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "New").length,
    drafted: leads.filter(l => l.status === "Drafted").length,
    sent: leads.filter(l => l.status === "Sent").length,
  };

  const filteredLeads = filter === "All" ? leads : leads.filter(l => l.status === filter);

  // ─── GENERATE DRAFT ────────────────────────────────────────────────────────
  async function generateDraft(leadId) {
    if (!apiKey) {
      setShowSettings(true);
      showToast("Add your Anthropic API key to .env first", "error");
      return;
    }
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    setGeneratingId(leadId);

    try {
      const { system, user } = buildPrompt(lead, activeProfile);
      const res = await fetch("/api/claude/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: system,
          messages: [{ role: "user", content: user }],
        }),
      });
      const data = await res.json();
      const body = data.content?.[0]?.text?.trim();

      if (!body) {
        showToast("API returned empty draft — check console", "error");
        console.error("Anthropic response:", data);
        return;
      }

      // Also generate a subject line
      const subRes = await fetch("/api/claude/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          messages: [{
            role: "user",
            content: `Write a cold email subject line for this email body. Make it lowercase, max 7 words, no "re:" prefix, no hype words. Just the subject, nothing else:\n\n${body}`,
          }],
        }),
      });
      const subData = await subRes.json();
      const subject = subData.content?.[0]?.text?.trim().replace(/['"]/g, "") || `re: ${lead.company}`;

      setLeads(prev => prev.map(l =>
        l.id === leadId
          ? { ...l, draft: body, profile: activeProfile, status: "Drafted", subject }
          : l
      ));
      showToast(`Draft written for ${lead.company} ✓`);
    } catch (err) {
      showToast("Generation failed — check API key or network", "error");
    } finally {
      setGeneratingId(null);
    }
  }

  // ─── SEND VIA GMAIL ────────────────────────────────────────────────────────
  function sendLead(lead) {
    const subject = lead.subject || `Quick thought on ${lead.company}`;
    const body = lead.draft || "";
    const mailto = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank");
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: "Sent" } : l));
    showToast(`Opened Gmail for ${lead.founder} ✓`);
  }

  function updateDraft(id, text) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, draft: text } : l));
    showToast("Draft updated ✓");
  }

  function addLead(form) {
    const newLead = {
      id: Date.now(), company: form.company, founder: form.founder,
      email: form.email, website: form.website, source: form.source,
      pitch: form.pitch, trigger: form.trigger, triggerNote: form.triggerNote,
      status: "New", draft: null, profile: null, subject: null,
    };
    setLeads(prev => [newLead, ...prev]);
    showToast(`${form.company} added ✓`);
  }

  function deleteLead(id) {
    setLeads(prev => prev.filter(l => l.id !== id));
  }

  // ─── SCAN PLATFORMS ──────────────────────────────────────────────────────
  async function handleScan() {
    setScanning(true);
    try {
      const results = await scanAllSources(leads);
      if (results.leads.length > 0) {
        setLeads(prev => [...results.leads, ...prev]);
        showToast(`Found ${results.leads.length} new leads from ${results.scanned.join(", ")} ✓`);
      } else if (results.errors.length > 0) {
        showToast(`Scan errors: ${results.errors.join("; ")}`, "error");
      } else {
        showToast("No new leads found — all up to date");
      }
    } catch (err) {
      showToast("Platform scan failed — check console", "error");
    } finally {
      setScanning(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #010409; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: #010409; }
        ::-webkit-scrollbar-thumb { background: #21262d; border-radius: 3px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#010409", fontFamily: "'JetBrains Mono', monospace" }}>
        {/* ── HEADER ── */}
        <div style={{
          borderBottom: "1px solid #21262d", padding: "0 32px",
          position: "sticky", top: 0, background: "#010409", zIndex: 100,
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${profile.color}30, ${profile.color}10)`,
                  border: `1px solid ${profile.color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14,
                }}>🎯</div>
                <span style={{ color: "#e6edf3", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>
                  Founder-Hunter
                </span>
              </div>
              <div style={{ width: 1, height: 20, background: "#21262d" }} />
              <div style={{ display: "flex", gap: 4 }}>
                {Object.values(PROFILES).map(p => (
                  <button key={p.id} onClick={() => setActiveProfile(p.id)}
                    style={{
                      background: activeProfile === p.id ? `${p.color}15` : "transparent",
                      color: activeProfile === p.id ? p.color : "#8b949e",
                      border: `1px solid ${activeProfile === p.id ? p.color + "40" : "transparent"}`,
                      padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {apiKey ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#3fb950", fontSize: 11 }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#3fb950", animation: "pulse 2s infinite" }} />
                  CLAUDE LIVE
                </div>
              ) : (
                <div style={{ color: "#f85149", fontSize: 11 }}>⚠ NO API KEY</div>
              )}
              <button onClick={handleScan} disabled={scanning} style={{
                background: scanning ? "#1a1a1a" : "#818cf815",
                color: scanning ? "#484f58" : "#818cf8",
                border: `1px solid ${scanning ? "#30363d" : "#818cf840"}`,
                padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: scanning ? "not-allowed" : "pointer",
              }}>{scanning ? "⟳ Scanning…" : "📡 Scan Platforms"}</button>
              <button onClick={() => setShowAddLead(true)} style={{
                background: "#00ff9d15", color: "#00ff9d", border: "1px solid #00ff9d40",
                padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: "pointer",
              }}>+ Add Lead</button>
              <button onClick={() => setShowSettings(true)} style={{
                background: "transparent", color: "#8b949e", border: "1px solid #30363d",
                padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              }}>⚙ Config</button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px" }}>
          {/* ── ACTIVE PROFILE BANNER ── */}
          <div style={{
            background: `linear-gradient(135deg, ${profile.color}08, transparent)`,
            border: `1px solid ${profile.color}20`,
            borderRadius: 10, padding: "14px 20px", marginBottom: 24,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <span style={{ color: profile.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>
                ACTIVE PERSONA
              </span>
              <div style={{ color: "#e6edf3", fontSize: 14, marginTop: 3, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
                {profile.bio}
              </div>
            </div>
            <div style={{ color: "#484f58", fontSize: 12, textAlign: "right" }}>
              <div>{profile.focus}</div>
            </div>
          </div>

          {/* ── STATS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
            {[
              { label: "Total Leads", value: stats.total, color: "#8b949e" },
              { label: "New", value: stats.new, color: "#00ff9d" },
              { label: "Drafted", value: stats.drafted, color: "#818cf8" },
              { label: "Sent", value: stats.sent, color: "#f87171" },
            ].map(stat => (
              <div key={stat.label} style={{
                background: "#0d1117", border: "1px solid #21262d",
                borderRadius: 8, padding: "14px 18px",
              }}>
                <div style={{ color: "#8b949e", fontSize: 11, letterSpacing: "0.08em", marginBottom: 4 }}>{stat.label.toUpperCase()}</div>
                <div style={{ color: stat.color, fontSize: 28, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* ── FILTERS + TABLE HEADER ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["All", "New", "Drafted", "Sent"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? "#21262d" : "transparent",
                    color: filter === f ? "#e6edf3" : "#8b949e",
                    border: `1px solid ${filter === f ? "#30363d" : "transparent"}`,
                    padding: "5px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                  }}>
                  {f} {f !== "All" && <span style={{ color: "#484f58" }}>({stats[f.toLowerCase()] ?? 0})</span>}
                </button>
              ))}
            </div>
            <div style={{ color: "#484f58", fontSize: 12 }}>
              {filteredLeads.length} leads · Persona: <span style={{ color: profile.color }}>{profile.tag}</span>
            </div>
          </div>

          {/* ── TABLE COLUMNS ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr auto",
            gap: 16, padding: "8px 20px", marginBottom: 6,
          }}>
            {["Company / Founder", "Trigger", "Draft Preview", "Status", "Actions"].map(h => (
              <div key={h} style={{ color: "#484f58", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }}>{h.toUpperCase()}</div>
            ))}
          </div>

          {/* ── LEADS ── */}
          {filteredLeads.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 0",
              color: "#484f58", fontSize: 14,
            }}>
              No leads in this filter. <button onClick={() => setShowAddLead(true)} style={{ background: "none", border: "none", color: "#00ff9d", cursor: "pointer", fontSize: 14 }}>Add one →</button>
            </div>
          ) : (
            filteredLeads.map(lead => (
              <LeadRow
                key={lead.id}
                lead={lead}
                activeProfile={activeProfile}
                onUpdate={updateDraft}
                onSend={sendLead}
                onGenerate={generateDraft}
                isGenerating={generatingId === lead.id}
              />
            ))
          )}

          {/* ── FOOTER ── */}
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid #21262d", display: "flex", justifyContent: "space-between", color: "#484f58", fontSize: 11 }}>
            <span>Founder-Hunter Outreach-OS · Built for Jimoh</span>
            <span>Powered by Claude · {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* ── MODALS ── */}
        {showSettings && (
          <SettingsModal apiKey={apiKey} onClose={() => setShowSettings(false)} />
        )}
        {showAddLead && (
          <AddLeadModal onAdd={addLead} onClose={() => setShowAddLead(false)} />
        )}
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>
    </>
  );
}