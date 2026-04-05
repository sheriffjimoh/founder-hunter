import { useState } from "react";

export default function SettingsModal({ apiKey, onClose }) {
  const masked = apiKey ? `${apiKey.slice(0, 10)}••••••${apiKey.slice(-4)}` : "Not configured";
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000090", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#0d1117", border: "1px solid #30363d", borderRadius: 12,
        padding: 32, width: 480, maxWidth: "90vw",
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: "#e6edf3", margin: "0 0 8px", fontFamily: "'Syne', sans-serif", fontSize: 18 }}>
          API Configuration
        </h3>
        <p style={{ color: "#8b949e", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>
          Anthropic API key is loaded from your <code style={{ color: "#e6edf3" }}>.env</code> file. Get one at console.anthropic.com
        </p>
        <label style={{ color: "#8b949e", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.08em" }}>
          ANTHROPIC API KEY
        </label>
        <div style={{
          display: "block", width: "100%", marginTop: 6, marginBottom: 20,
          background: "#010409", border: "1px solid #30363d", borderRadius: 6,
          color: apiKey ? "#3fb950" : "#f85149", padding: "10px 12px", fontSize: 13, fontFamily: "monospace",
          boxSizing: "border-box",
        }}>{masked}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            background: "transparent", color: "#8b949e", border: "1px solid #30363d",
            padding: "8px 20px", borderRadius: 6, fontSize: 13, cursor: "pointer",
          }}>Close</button>
        </div>
        <p style={{ marginTop: 16, color: "#484f58", fontSize: 11, lineHeight: 1.5 }}>
          Set <code style={{ color: "#8b949e" }}>REACT_APP_ANTHROPIC_KEY</code> in your <code style={{ color: "#8b949e" }}>.env</code> file. Proxied server-side — never exposed to the browser.
        </p>
      </div>
    </div>
  );
}
