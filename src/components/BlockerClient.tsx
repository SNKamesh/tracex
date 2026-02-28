"use client";

import { useState } from "react";

export default function BlockerClient() {
  const [sites, setSites] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const addSite = () => {
    if (!input.trim()) return;
    setSites([...sites, input.trim()]);
    setInput("");
  };

  const removeSite = (site: string) => {
    setSites(sites.filter((s) => s !== site));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Website Blocker</h1>

      <p style={{ marginTop: "5px", marginBottom: "20px", color: "#888" }}>
        Add websites you want to block inside your Chrome Extension.
      </p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="example: youtube.com"
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            flex: 1,
          }}
        />

        <button
          onClick={addSite}
          style={{
            padding: "8px 16px",
            background: "#6366f1",
            color: "white",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {sites.map((site) => (
          <li
            key={site}
            style={{
              marginBottom: "10px",
              padding: "10px",
              background: "#f3f4f6",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {site}
            <button
              onClick={() => removeSite(site)}
              style={{
                background: "red",
                color: "white",
                padding: "5px 10px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}