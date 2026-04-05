import { useEffect } from "react";

export default function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 9999,
      background: type === "error" ? "#2a0a0a" : "#0a1a10",
      border: `1px solid ${type === "error" ? "#f8717140" : "#00ff9d40"}`,
      color: type === "error" ? "#f87171" : "#00ff9d",
      padding: "12px 20px", borderRadius: 8, fontSize: 13,
      fontFamily: "monospace", boxShadow: "0 8px 32px #00000080",
      animation: "slideUp 0.3s ease",
    }}>{message}</div>
  );
}
