"use client";

import React, { useState, useEffect, useRef } from "react";

interface ImmersiveRoomProps {
  onAddFocusTime: (seconds: number) => void;
}

export default function ImmersiveVirtualRoom({ onAddFocusTime }: ImmersiveRoomProps) {
  // Room Operational Timers
  const [roomSeconds, setRoomSeconds] = useState(0);
  const [isRoomActive, setIsRoomActive] = useState(false);

  // Floating Popups Management States
  const [activeMenu, setActiveMenu] = useState<"background" | "sound" | "quotes" | null>(null);
  
  // Custom Design Preset Asset Links
  const [selectedBg, setSelectedBg] = useState("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200");
  const [volumes, setVolumes] = useState({ lofi: 50, rain: 20, fireplace: 0, library: 10 });
  const [currentQuote, setCurrentQuote] = useState("The only way to do great work is to love what you do.");

  // Timer Tick Core Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRoomActive) {
      interval = setInterval(() => {
        setRoomSeconds((prev) => {
          const nextTime = prev + 1;
          // Dynamically bubble the data payload back to the master hub for total merge calculation
          onAddFocusTime(1);
          return nextTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRoomActive, onAddFocusTime]);

  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSecs % 60).toString().padStart(2, "0");
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  const backgrounds = [
    { name: "Cosmic Desk", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200" },
    { name: "Anime Library", url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200" },
    { name: "Rainy Cafe", url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200" },
    { name: "Cyberpunk Tech Lounge", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200" }
  ];

  return (
    <div 
      className="relative w-full h-[600px] rounded-2xl border border-slate-800 overflow-hidden bg-cover bg-center transition-all duration-700 shadow-2xl"
      style={{ backgroundImage: `url(${selectedBg})` }}
    >
      {/* Immersive Glassmorphism Vignette Dark Overlay Filter */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70 backdrop-blur-[1px]" />

      {/* TOP MENUBAR: Room Meta Widgets */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="flex gap-3">
          <div className="bg-slate-950/80 border border-slate-800 backdrop-blur-xl px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">Room Clock</span>
            <span className="font-mono text-sm font-bold text-white">{formatTime(roomSeconds)}</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 backdrop-blur-xl px-4 py-2 rounded-xl flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRoomActive ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`} />
            <span className="text-xs text-slate-300 font-medium">455 Studying Live</span>
          </div>
        </div>

        {/* Floating Controller Panel Selectors */}
        <div className="flex gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/50 backdrop-blur-md">
          <button onClick={() => setActiveMenu(activeMenu === "background" ? null : "background")} className={`p-2 rounded-lg text-sm transition-all ${activeMenu === "background" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-900"}`} title="Change Workspace Canvas">🖼️</button>
          <button onClick={() => setActiveMenu(activeMenu === "sound" ? null : "sound")} className={`p-2 rounded-lg text-sm transition-all ${activeMenu === "sound" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-900"}`} title="Audio Soundboard Mixers">🎵</button>
          <button onClick={() => setActiveMenu(activeMenu === "quotes" ? null : "quotes")} className={`p-2 rounded-lg text-sm transition-all ${activeMenu === "quotes" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-900"}`} title="Inspirational Context Rules">✍️</button>
        </div>
      </div>

      {/* CENTER STAGE: Deep Focus Central Play State Controls */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
        <button 
          onClick={() => setIsRoomActive(!isRoomActive)}
          className="group w-20 h-20 bg-white/10 hover:bg-blue-600 border border-white/20 hover:border-blue-500 text-white text-3xl rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isRoomActive ? "⏸️" : "▶️"}
        </button>
        
        <div className="max-w-md mt-6 transition-all duration-500 bg-black/30 backdrop-blur-xs p-4 rounded-xl border border-white/5">
          <p className="text-sm md:text-base italic font-medium text-slate-100 drop-shadow-md">
            "{currentQuote}"
          </p>
        </div>
      </div>

      {/* FLOATING ACTION SHEET SHEET POPUPS */}
      {activeMenu && (
        <div className="absolute right-4 top-20 w-72 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl p-4 z-30 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {activeMenu === "background" && "Workspace Backgrounds"}
              {activeMenu === "sound" && "Soundscape Mixing Studio"}
              {activeMenu === "quotes" && "Focus Manifesto Quotes"}
            </h4>
            <button onClick={() => setActiveMenu(null)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
          </div>

          {/* 1. BACKGROUND SELECTION PANEL GRID */}
          {activeMenu === "background" && (
            <div className="grid grid-cols-2 gap-2">
              {backgrounds.map((bg) => (
                <button
                  key={bg.name}
                  onClick={() => setSelectedBg(bg.url)}
                  style={{ backgroundImage: `url(${bg.url})` }}
                  className={`h-20 bg-cover bg-center rounded-xl relative overflow-hidden group border-2 transition-all ${selectedBg === bg.url ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-transparent hover:border-slate-700"}`}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                  <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white drop-shadow">{bg.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* 2. ADVANCED AMBIENT MIXER CONTROLLERS */}
          {activeMenu === "sound" && (
            <div className="space-y-4 py-1">
              {Object.keys(volumes).map((key) => {
                const name = key as keyof typeof volumes;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-400 capitalize">
                      <span>{key} Focus Track</span>
                      <span className="font-mono text-blue-400">{volumes[name]}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={volumes[name]}
                      onChange={(e) => setVolumes({ ...volumes, [name]: parseInt(e.target.value) })}
                      className="w-full h-1 bg-slate-800 accent-blue-500 rounded-lg cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. FOCUS MANIFESTO COMPONENT */}
          {activeMenu === "quotes" && (
            <div className="space-y-2">
              {[
                "The only way to do great work is to love what you do.",
                "Focus is a muscle, and you are building a temple of absolute discipline.",
                "Don't care about the distraction curves. Focus on your trajectory.",
                "Beast mode isn't a premium tier feature, it is an engineering mindset."
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setCurrentQuote(q); setActiveMenu(null); }}
                  className="w-full text-left text-xs p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-slate-300 hover:bg-blue-600/10 hover:border-blue-500/30 transition-all"
                >
                  "{q}"
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOTTOM FOOTER HUD: Collaborative Participant Row */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="flex items-center -space-x-2 overflow-hidden">
          {["KM", "SK", "AI", "TR"].map((initial, i) => (
            <div 
              key={i} 
              className="w-8 h-8 rounded-full border border-slate-900 bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-[10px] shadow-lg"
            >
              {initial}
            </div>
          ))}
          <span className="text-[10px] font-medium text-slate-400 ml-4 bg-slate-950/40 px-2 py-1 rounded-md border border-white/5 backdrop-blur-sm">
            +451 others co-working silently...
          </span>
        </div>
      </div>
    </div>
  );
}