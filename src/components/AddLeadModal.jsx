import { useState } from "react";

export default function AddLeadModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    company: "", founder: "", email: "", website: "",
    source: "PH", pitch: "", triggerNote: "", trigger: "launch",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000090", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto",
    }} onClick={onClose}>
      <div style={{
        background: "#0d1117", border: "1px solid #30363d", borderRadius: 12,
        padding: 32, width: 520, maxWidth: "92vw", margin: "auto",
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: "#e6edf3", margin: "0 0 20px", fontFamily: "'Syne', sans-serif", fontSize: 18 }}>
          Add Lead Manually
        </h3>
        {[
          ["Company Name", "company", "text", "Agentica AI"],
          ["Founder Name", "founder", "text", "Sarah Chen"],
          ["Email", "email", "email", "sarah@agentica.ai"],
          ["Website", "website", "text", "agentica.ai"],
        ].map(([label, key, type, ph]) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ color: "#8b949e", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em" }}>{label.toUpperCase()}</label>
            <input value={form[key]} onChange={e => set(key, e.target.value)} type={type} placeholder={ph}
              style={{
                display: "block", width: "100%", marginTop: 4,
                background: "#010409", border: "1px solid #30363d", borderRadius: 6,
                color: "#e6edf3", padding: "8px 12px", fontSize: 13, fontFamily: "monospace",
                outline: "none", boxSizing: "border-box",
              }} />
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ color: "#8b949e", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em" }}>SOURCE</label>
            <select value={form.source} onChange={e => set("source", e.target.value)}
              style={{
                display: "block", width: "100%", marginTop: 4,
                background: "#010409", border: "1px solid #30363d", borderRadius: 6,
                color: "#e6edf3", padding: "8px 12px", fontSize: 13,
                outline: "none", boxSizing: "border-box",
              }}>
              <option>PH</option><option>YC</option><option>Wellfound</option>
            </select>
          </div>
          <div>
            <label style={{ color: "#8b949e", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em" }}>TRIGGER TYPE</label>
            <select value={form.trigger} onChange={e => set("trigger", e.target.value)}
              style={{
                display: "block", width: "100%", marginTop: 4,
                background: "#010409", border: "1px solid #30363d", borderRadius: 6,
                color: "#e6edf3", padding: "8px 12px", fontSize: 13,
                outline: "none", boxSizing: "border-box",
              }}>
              <option value="launch">Launch</option>
              <option value="funding">Funding</option>
              <option value="hiring">Hiring</option>
              <option value="modernization">Modernization</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: "#8b949e", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em" }}>TRIGGER NOTE</label>
          <input value={form.triggerNote} onChange={e => set("triggerNote", e.target.value)}
            placeholder="e.g. Just launched on PH — #2 product of the day"
            style={{
              display: "block", width: "100%", marginTop: 4,
              background: "#010409", border: "1px solid #30363d", borderRadius: 6,
              color: "#e6edf3", padding: "8px 12px", fontSize: 13,
              outline: "none", boxSizing: "border-box",
            }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: "#8b949e", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em" }}>COMPANY PITCH / CONTEXT</label>
          <textarea value={form.pitch} onChange={e => set("pitch", e.target.value)}
            placeholder="What they do, recent traction, key features..."
            style={{
              display: "block", width: "100%", marginTop: 4, minHeight: 80,
              background: "#010409", border: "1px solid #30363d", borderRadius: 6,
              color: "#e6edf3", padding: "8px 12px", fontSize: 13,
              outline: "none", boxSizing: "border-box", resize: "vertical",
            }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { onAdd(form); onClose(); }} style={{
            background: "#00ff9d20", color: "#00ff9d", border: "1px solid #00ff9d50",
            padding: "8px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "monospace",
          }}>Add Lead</button>
          <button onClick={onClose} style={{
            background: "transparent", color: "#8b949e", border: "1px solid #30363d",
            padding: "8px 20px", borderRadius: 6, fontSize: 13, cursor: "pointer",
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
