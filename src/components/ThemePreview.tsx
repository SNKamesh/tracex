"use client";

export default function ThemePreview({ theme, selected, isLight }: any) {
  const borderColor = selected ? "#00d8ff" : isLight ? "#cbd5e1" : "#334155";
  const textColor   = isLight ? "#0f172a" : "#f8fafc";
  const subColor    = isLight ? "#475569" : "#94a3b8";
  const cardBg      = isLight ? "#f8fafc" : "#1e293b";

  return (
    <div style={{
      borderRadius: "14px",
      padding: "16px",
      border: `2px solid ${borderColor}`,
      backgroundColor: cardBg,
      transition: "border-color 0.2s",
      boxShadow: selected ? "0 0 0 2px #00d8ff33" : "none",
    }}>
      <div style={{
        height: "80px",
        borderRadius: "10px",
        backgroundColor: theme.bg,
        border: "1px solid #ffffff22",
      }} />
      <p style={{ marginTop: "10px", fontWeight: 600, color: textColor }}>{theme.name}</p>
      <p style={{ fontSize: "12px", color: subColor, marginTop: "4px" }}>{theme.description}</p>
    </div>
  );
}