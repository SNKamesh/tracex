import React, { useState } from "react";
import {
  FiBell,
  FiCloud,
  FiShield,
  FiMic,
  FiMoon,
  FiMoreVertical,
} from "react-icons/fi";

const Settings: React.FC = () => {
  const [theme, setTheme] = useState<string>("Dark");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [cloudBackup, setCloudBackup] = useState<boolean>(false);
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [micAccess, setMicAccess] = useState<boolean>(false);

  const handleSaveSettings = () => {
    console.log("Settings saved");
  };

  const settingItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #1F2937",
  };

  const leftStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A0A0A",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px",
          backgroundColor: "#000",
        }}
      >
        <h1 style={{ margin: 0 }}>Settings</h1>
        <FiMoreVertical size={22} />
      </div>

      <div style={{ padding: "20px" }}>
        {/* Appearance */}
        <h4 style={{ color: "#6B7280" }}>APPEARANCE</h4>
        <div
          style={{
            background: "#111827",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <div style={leftStyle}>
            <FiMoon />
            <span>Theme</span>
            <input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{
                marginLeft: "auto",
                padding: "6px",
                background: "#1F2937",
                color: "white",
                border: "1px solid #333",
                borderRadius: "6px",
              }}
            />
          </div>
        </div>

        {/* Preferences */}
        <h4 style={{ color: "#6B7280" }}>PREFERENCES</h4>
        <div
          style={{
            background: "#111827",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={settingItemStyle}>
            <div style={leftStyle}>
              <FiBell />
              <span>Notifications</span>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
          </div>

          <div style={settingItemStyle}>
            <div style={leftStyle}>
              <FiCloud />
              <span>Cloud Backup</span>
            </div>
            <input
              type="checkbox"
              checked={cloudBackup}
              onChange={() => setCloudBackup(!cloudBackup)}
            />
          </div>
        </div>

        {/* Privacy */}
        <h4 style={{ color: "#6B7280" }}>PRIVACY & SECURITY</h4>
        <div
          style={{
            background: "#111827",
            borderRadius: "12px",
          }}
        >
          <div style={settingItemStyle}>
            <div style={leftStyle}>
              <FiShield />
              <span>Privacy Mode</span>
            </div>
            <input
              type="checkbox"
              checked={privacyMode}
              onChange={() => setPrivacyMode(!privacyMode)}
            />
          </div>

          <div style={settingItemStyle}>
            <div style={leftStyle}>
              <FiMic />
              <span>Mic Access</span>
            </div>
            <input
              type="checkbox"
              checked={micAccess}
              onChange={() => setMicAccess(!micAccess)}
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          style={{
            marginTop: "30px",
            width: "100%",
            padding: "14px",
            backgroundColor: "#3B82F6",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;