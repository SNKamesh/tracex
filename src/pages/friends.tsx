"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseAuth() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getAuth(app);
}

type Friend = { uid: string; name: string; traceId: string; };
type Request = { uid: string; name: string; traceId: string; };

export default function Friends() {
  const [uid, setUid] = useState("");
  const [myTraceId, setMyTraceId] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [targetId, setTargetId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUid(user.uid);
      const res = await fetch(`/api/friends/get?uid=${user.uid}`);
      const data = await res.json();
      setMyTraceId(data.traceId || "");
      setFriends(data.friends || []);
      setRequests(data.requests || []);
    });
  }, []);

  async function sendRequest() {
    if (!targetId.trim()) return;
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/friends/send-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderUid: uid, targetTraceId: targetId.trim() }),
    });
    const data = await res.json();
    if (res.ok) { setMessage("✅ Request sent!"); setTargetId(""); }
    else setMessage(`❌ ${data.error}`);
    setLoading(false);
  }

  async function respond(senderUid: string, action: "accept" | "reject") {
    await fetch("/api/friends/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, senderUid, action }),
    });
    // Refresh
    const res = await fetch(`/api/friends/get?uid=${uid}`);
    const data = await res.json();
    setFriends(data.friends || []);
    setRequests(data.requests || []);
  }

  return (
    <AppShell>
      <PageHeader
        title="Friends"
        subtitle="Connect, motivate, and study together."
      />

      {/* My TraceX ID */}
      <SectionCard title="Your TraceX ID" description="Share this with friends so they can add you.">
        <div style={{
          fontSize: "24px", fontWeight: 800, letterSpacing: "4px",
          color: "#00d8ff", padding: "12px 0"
        }}>
          {myTraceId || "Loading..."}
        </div>
        <Button onClick={() => { navigator.clipboard.writeText(myTraceId); setMessage("✅ Copied!"); }}>
          Copy ID
        </Button>
      </SectionCard>

      {/* Add Friend */}
      <SectionCard title="Add Friend by TraceX ID" description="Send a request to connect.">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Enter TraceX ID e.g. TRXABC123"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          />
          <Button onClick={sendRequest} disabled={loading}>
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </div>
        {message && <p className="mt-2 text-sm text-slate-400">{message}</p>}
      </SectionCard>

      {/* Requests */}
      <SectionCard title="Requests" description="Approve or reject incoming invites.">
        {requests.length === 0 ? (
          <p className="text-sm text-slate-400">No pending requests.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {requests.map((r) => (
              <div key={r.uid} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                <div>
                  <p className="font-semibold">{r.name || "Unknown"}</p>
                  <p className="text-xs text-slate-400">{r.traceId}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => respond(r.uid, "accept")}>Accept</Button>
                  <Button variant="ghost" onClick={() => respond(r.uid, "reject")}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Friends List */}
      <SectionCard title="Friends List" description="Status, session joins, and motivation cards.">
        {friends.length === 0 ? (
          <p className="text-sm text-slate-400">No friends yet. Add someone by their TraceX ID!</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {friends.map((f) => (
              <div key={f.uid} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                <div>
                  <p className="font-semibold">{f.name}</p>
                  <p className="text-xs text-slate-400">{f.traceId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary">Join Session</Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-3 mt-3">
          <Button variant="secondary">Send Motivation Card</Button>
          <Button variant="secondary">Share Study Plan</Button>
        </div>
      </SectionCard>
    </AppShell>
  );
}