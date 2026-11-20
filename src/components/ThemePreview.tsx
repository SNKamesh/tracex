"use client";

type ThemeOption = {
  name: string;
  description: string;
  bg: string;
};

export default function ThemePreview({ theme, selected }: { theme: ThemeOption; selected: boolean; isLight?: boolean }) {
  const isLightTheme = theme.name === "Light";
  const previewText = isLightTheme ? "#292D26" : "#F1F0E9";
  const muted = isLightTheme ? "#73796F" : "#A0A79A";
  const panel = isLightTheme ? "#FBFAF6" : theme.name === "AMOLED" ? "#10120F" : "#20241F";
  const border = selected ? "#D17A55" : isLightTheme ? "#E1DED4" : "#363D34";

  return (
    <div style={{ borderRadius: "16px", padding: "12px", border: `1.5px solid ${border}`, backgroundColor: panel, transition: "border-color 180ms ease", boxShadow: selected ? "0 0 0 3px #D17A5520" : "none" }}>
      <div style={{ height: "90px", borderRadius: "10px", overflow: "hidden", backgroundColor: theme.bg, border: `1px solid ${isLightTheme ? "#E1DED4" : "#343B32"}`, padding: "12px", display: "flex", gap: "8px" }}>
        <div style={{ width: "24px", borderRadius: "6px", background: isLightTheme ? "#EAE7DE" : "#282D26" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "7px", paddingTop: "3px" }}>
          <div style={{ width: "55%", height: "7px", borderRadius: "8px", background: "#D17A55" }} />
          <div style={{ width: "78%", height: "5px", borderRadius: "8px", background: muted, opacity: .55 }} />
          <div style={{ width: "66%", height: "5px", borderRadius: "8px", background: muted, opacity: .35 }} />
          <div style={{ display: "flex", gap: "6px", marginTop: "5px" }}>
            <div style={{ flex: 1, height: "24px", borderRadius: "5px", background: panel, border: `1px solid ${border}` }} />
            <div style={{ flex: 1, height: "24px", borderRadius: "5px", background: panel, border: `1px solid ${border}` }} />
          </div>
        </div>
      </div>
      <p style={{ marginTop: "11px", fontWeight: 650, color: previewText, fontSize: "14px" }}>{theme.name}</p>
      <p style={{ fontSize: "11px", color: muted, marginTop: "4px", lineHeight: 1.5 }}>{theme.description}</p>
      <p style={{ fontSize: "10px", color: selected ? "#D17A55" : muted, marginTop: "10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>{selected ? "Selected" : "Preview"}</p>
    </div>
  );
}
