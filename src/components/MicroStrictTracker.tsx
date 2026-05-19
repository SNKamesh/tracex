"use client";

import React, { useEffect, useRef, useState } from "react";

export default function MicroStrictTracker() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  
  // App States
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [studentPresent, setStudentPresent] = useState(true); 
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [cameraError, setCameraError] = useState("");
  
  // Real-time Stats
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [distractionSeconds, setDistractionSeconds] = useState(0);

  // 1. Initialize Camera Feed
  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240, facingMode: "user" } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsModelLoaded(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(err.message || "Camera access denied. Check permissions.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Automated AI Vision Scanner (Catches Shutter Blocks AND Seat Exits)
  useEffect(() => {
    let scannerInterval: NodeJS.Timeout;

    if (isTracking) {
      scannerInterval = setInterval(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (!video || !canvas || video.readyState < 2) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          let blackPixelCount = 0;
          let totalDiff = 0;
          const totalPixels = pixels.length / 4;

          // Process and compare pixel configurations
          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // Shutter Block Scanner (Checks for pitch black lens covers)
            if (r < 25 && g < 25 && b < 25) {
              blackPixelCount++;
            }

            // Automated Presence Tracker (Analyzes shifts against reference framework)
            if (prevFrameRef.current) {
              const oldR = prevFrameRef.current[i];
              const oldG = prevFrameRef.current[i + 1];
              const oldB = prevFrameRef.current[i + 2];
              
              // Standard ambient lighting variances
              totalDiff += Math.abs(r - oldR) + Math.abs(g - oldG) + Math.abs(b - oldB);
            }
          }

          // A. Shutter Check
          const blackPercentage = (blackPixelCount / totalPixels) * 100;
          if (blackPercentage > 95) {
            setCameraBlocked(true);
            return;
          } else {
            setCameraBlocked(false);
          }

          // B. Automated Seat Exit Check
          const averagePixelVariance = totalDiff / totalPixels;
          
          if (prevFrameRef.current) {
            // When a student moves completely out of the frame, variance drops below critical stability thresholds
            if (averagePixelVariance < 12) {
              setStudentPresent(false);
            } else {
              setStudentPresent(true);
            }
          }

          // Store reference framework for next evaluation tick
          prevFrameRef.current = new Uint8ClampedArray(pixels);

        } catch (e) {
          console.error("Pixel analysis error:", e);
        }
      }, 1000);
    } else {
      setCameraBlocked(false);
      setStudentPresent(true);
      prevFrameRef.current = null;
    }

    return () => clearInterval(scannerInterval);
  }, [isTracking]);

  // 3. System Timers Clock Loop Logic
  useEffect(() => {
    if (!isTracking || cameraBlocked) return;

    const timer = setInterval(() => {
      if (studentPresent) {
        setFocusSeconds((prev) => prev + 1);
      } else {
        setDistractionSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTracking, studentPresent, cameraBlocked]);

  const handleStopSession = () => {
    setIsTracking(false);
    setFocusSeconds(0);
    setDistractionSeconds(0);
    setStudentPresent(true);
    setCameraBlocked(false);
    prevFrameRef.current = null;
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 flex flex-col items-center">
      
      {/* Hidden high-performance layout scanner */}
      <canvas ref={canvasRef} width={40} height={30} style={{ display: "none" }} />

      {/* Visual Status Indicator Panel */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-4 w-4 rounded-full ${
          cameraError ? "bg-amber-500" : 
          !isTracking ? "bg-slate-600" : 
          cameraBlocked ? "bg-purple-600 animate-ping" :
          studentPresent ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]"
        } ${isTracking && !cameraBlocked ? "animate-pulse" : ""}`} />
        
        <h2 className="text-xl font-bold text-white">
          {cameraError ? "Hardware Error" : 
           !isTracking ? "System Ready" : 
           cameraBlocked ? "SECURITY ERROR: Camera Blocked!" :
           studentPresent ? "Tracking: Focus Active" : "WARNING: Missing!"}
        </h2>
      </div>

      {/* Camera Window UI */}
      <div className="relative w-64 h-48 bg-black rounded-lg overflow-hidden border-2 border-slate-800 mb-6">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-red-950/20 text-xs text-red-400">
            <span>⚠️ {cameraError}</span>
            <button onClick={startCamera} className="mt-2 text-blue-400 underline">Retry Camera</button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              (isTracking && !studentPresent) || cameraBlocked ? "opacity-20 grayscale blur-[2px]" : "opacity-100"
            }`}
          />
        )}
        {cameraBlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-xs font-bold text-purple-400 bg-purple-950/40 backdrop-blur-md animate-pulse">
            <span>⚠️ HARDWARE BLOCK DETECTED</span>
            <span className="text-[10px] font-normal text-slate-300 mt-1">Open your physical webcam shutter to resume timers.</span>
          </div>
        )}
        {!isModelLoaded && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-blue-400 bg-slate-900/80 backdrop-blur-sm">
            Waking up Camera Interface...
          </div>
        )}
      </div>

      {/* Analytics Counter Dashboard */}
      <div className="grid grid-cols-2 gap-4 w-full mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Focus Time</p>
          <p className="text-3xl font-mono font-bold text-emerald-400">{formatTime(focusSeconds)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Distraction Time</p>
          <p className="text-3xl font-mono font-bold text-red-400">{formatTime(distractionSeconds)}</p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="w-full flex flex-col gap-2">
        {!isTracking ? (
          <button 
            onClick={() => setIsTracking(true)}
            disabled={!!cameraError || !isModelLoaded}
            className="w-full py-4 bg-blue-600 text-white hover:bg-blue-500 font-bold text-lg rounded-xl shadow-lg transition-all active:scale-98"
          >
            Start MicroStrict Session
          </button>
        ) : (
          <button 
            onClick={handleStopSession}
            className="w-full py-4 bg-red-600 text-white hover:bg-red-500 font-bold text-lg rounded-xl shadow-lg transition-all active:scale-98"
          >
            Stop Session
          </button>
        )}
      </div>

    </div>
  );
}