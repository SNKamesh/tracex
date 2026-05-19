"use client";

import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

export default function MicroStrictTracker() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // App States
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [studentPresent, setStudentPresent] = useState(false);
  
  // Real-time Stats
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [distractionSeconds, setDistractionSeconds] = useState(0);

  // 1. Initialize Webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Please allow camera access to use MicroStrict mode.");
    }
  };

  // 2. Load the AI Face Detection Model
  useEffect(() => {
    async function loadModel() {
      await tf.ready(); // Initialize TensorFlow hardware acceleration
      const model = await blazeface.load();
      setIsModelLoaded(true);
      
      // Start checking the camera every 1 second
      setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const faces = await model.estimateFaces(videoRef.current, false);
          
          if (faces.length > 0) {
            setStudentPresent(true);
          } else {
            setStudentPresent(false);
          }
        }
      }, 1000); // 1000ms = 1 second
    }

    startCamera().then(loadModel);
  }, []);

  // 3. The Real-Time Stat Engine
  useEffect(() => {
    if (!isTracking) return;

    const timer = setInterval(() => {
      if (studentPresent) {
        setFocusSeconds((prev) => prev + 1);
      } else {
        setDistractionSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTracking, studentPresent]);

  // Helper to format time (e.g., 65s -> 01:05)
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 flex flex-col items-center">
      
      {/* Visual Status Indicator */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-4 w-4 rounded-full animate-pulse ${studentPresent ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]"}`} />
        <h2 className="text-xl font-bold text-white">
          {studentPresent ? "Target Locked. Focus Active." : "WARNING: Student Missing!"}
        </h2>
      </div>

      {/* Camera Feed (Shrunk down so it isn't distracting) */}
      <div className="relative w-64 h-48 bg-black rounded-lg overflow-hidden border-2 border-slate-800 mb-6">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className={`w-full h-full object-cover transition-opacity duration-300 ${!studentPresent ? "opacity-30 grayscale" : "opacity-100"}`}
        />
        {!isModelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-blue-400 bg-slate-900/80 backdrop-blur-sm">
            Waking up AI Vision...
          </div>
        )}
      </div>

      {/* Real-time Stats Dashboard */}
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
      <button 
        onClick={() => setIsTracking(!isTracking)}
        disabled={!isModelLoaded}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          isTracking 
            ? "bg-slate-800 text-white hover:bg-slate-700" 
            : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
        }`}
      >
        {isTracking ? "Pause Tracking" : "Start MicroStrict Session"}
      </button>

    </div>
  );
}