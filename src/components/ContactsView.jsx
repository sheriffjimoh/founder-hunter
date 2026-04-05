import { useState } from "react";

export default function ContactsView({ contacts, onDelete }) {
  const [search, setSearch] = useState("");

  const filtered = contacts.filter(c =>
    [c.company, c.name, c.email, c.position].some(v =>
      v && v.toLowerCase().includes(search.toLowerCase())
    )
  );

  function copyEmail(email) {
    navigator.clipboard.writeText(email);
  }

  function exportCSV() {
    const header = "Company,Name,Position,Email,Confidence,Domain,Found At";
    const rows = contacts.map(c =>
      [c.company, c.name, c.position, c.email, c.confidence, c.domain, c.foundAt]
        .map(v => `"${(v || "").toString().replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `founder-hunter-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: "#0d1117", border: "1px solid #30363d", borderRadius: 6,
              padding: "7px 12px", color: "#e6edf3", fontSize: 12, width: 240,
              fontFamily: "'JetBrains Mono', monospace", outline: "none",
            }}
          />
          <span style={{ color: "#484f58", fontSize: 12 }}>
            {filtered.length} contact{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        {contacts.length > 0 && (
          <button onClick={exportCSV} style={{
            background: "#818cf815", color: "#818cf8", border: "1px solid #818cf840",
            padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "monospace",
          }}>⤓ Export CSV</button>
        )}
      </div>

      {/* Table header */}
      <div style={{
        display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1.2fr 2fr 0.6fr 0.5fr",
        gap: 12, padding: "8px 20px", marginBottom: 6,
      }}>
        {["Company", "Name", "Position", "Email", "Confidence", ""].map(h => (
          <div key={h} style={{ color: "#484f58", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }}>
            {h.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 0", color: "#484f58", fontSize: 14,
        }}>
          {contacts.length === 0
            ? 'No contacts yet. Use "🔍 Find Email" on a lead to discover contacts.'
            : "No contacts match your search."}
        </div>
      ) : (
        filtered.map((c, i) => (
          <div key={c.id || i} style={{
            display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1.2fr 2fr 0.6fr 0.5fr",
            gap: 12, alignItems: "center", padding: "12px 20px",
            background: "#0d1117", border: "1px solid #21262d",
            borderRadius: 8, marginBottom: 6,
            transition: "border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#30363d"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#21262d"}
          >
            <div style={{ color: "#e6edf3", fontSize: 13, fontWeight: 600 }}>{c.company}</div>
            <div style={{ color: "#c9d1d9", fontSize: 13 }}>{c.name}</div>
            <div style={{ color: "#8b949e", fontSize: 12 }}>{c.position || "—"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#58a6ff", fontSize: 13, fontFamily: "monospace" }}>{c.email}</span>
              <button onClick={() => copyEmail(c.email)} title="Copy email" style={{
                background: "transparent", border: "1px solid #30363d", color: "#8b949e",
                padding: "2px 6px", borderRadius: 4, fontSize: 10, cursor: "pointer",
              }}>📋</button>
            </div>
            <div>
              {c.confidence > 0 && (
                <span style={{
                  color: c.confidence >= 80 ? "#3fb950" : c.confidence >= 50 ? "#f59e0b" : "#f85149",
                  fontSize: 12, fontWeight: 600,
                }}>{c.confidence}%</span>
              )}
            </div>
            <div>
              <button onClick={() => onDelete(c.id)} title="Remove contact" style={{
                background: "transparent", border: "1px solid #30363d", color: "#8b949e",
                padding: "2px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer",
              }}>✕</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
