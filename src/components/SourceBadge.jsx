export default function SourceBadge({ source }) {
  const map = {
    PH: { label: "Product Hunt", bg: "#2a1500", color: "#ff6b35" },
    YC: { label: "YC", bg: "#2a1a00", color: "#f59e0b" },
    Wellfound: { label: "Wellfound", bg: "#001a2a", color: "#38bdf8" },
  };
  const s = map[source] || { label: source, bg: "#1a1a1a", color: "#9ca3af" };
  return (
    <span style={{
      background: s.bg, color: s.color, padding: "2px 8px",
      borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: "monospace",
    }}>{s.label}</span>
  );
}
