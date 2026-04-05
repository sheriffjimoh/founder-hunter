export default function StatusBadge({ status }) {
  const styles = {
    New: { bg: "#1a2a1f", color: "#00ff9d", border: "#00ff9d30" },
    Drafted: { bg: "#1a1a2e", color: "#818cf8", border: "#818cf830" },
    Sent: { bg: "#1a1010", color: "#f87171", border: "#f8717130" },
  };
  const s = styles[status] || styles.New;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace",
    }}>{status}</span>
  );
}
