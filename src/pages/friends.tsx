"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";

interface Friend {
  uid:      string;
  name:     string;
  traceXId: string;
  status:   "Online" | "Offline";
}

interface Request {
  uid:      string;
  name:     string;
  traceXId: string;
}

export default function Friends() {
  const [myUid,     setMyUid]     = useState<string | null>(null);
  const [myTraceId, setMyTraceId] = useState("");
  const [myName,    setMyName]    = useState("");

  const [searchId,  setSearchId]  = useState("");
  const [searchErr, setSearchErr] = useState("");
  const [searchOk,  setSearchOk]  = useState("");
  const [copied,    setCopied]    = useState(false);

  const [requests, setRequests] = useState<Request[]>([]);
  const [friends,  setFriends]  = useState<Friend[]>([]);
  const [loading,  setLoading]  = useState(true);

  // ── Auth & user doc setup ──────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      setMyUid(user.uid);

      const ref  = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        const name = user.displayName || user.email?.split("@")[0] || "TraceX User";
        await setDoc(ref, {
          name,
          email:        user.email,
          status:       "Online",
          friends:      [],
          sentReqs:     [],
          receivedReqs: [],
        });
        setMyName(name);
      } else {
        const data = snap.data();
        setMyTraceId(data.tracexId || "");
        setMyName(data.name || "");
        await updateDoc(ref, { status: "Online" });
      }

      setLoading(false);
    });

    // Mark offline on tab close
    const handleUnload = async () => {
      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { status: "Offline" });
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => { unsub(); window.removeEventListener("beforeunload", handleUnload); };
  }, []);

  // ── Live listener: friends + requests (parallel fetching) ──
  useEffect(() => {
    if (!myUid) return;
    const ref = doc(db, "users", myUid);
    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) return;
      const receivedUids: string[] = snap.data().receivedReqs || [];
      const friendUids:   string[] = snap.data().friends      || [];

      // Fetch ALL requests in parallel
      const reqProfiles = await Promise.all(
        receivedUids.map((uid) => getDoc(doc(db, "users", uid)))
      );
      const reqData: Request[] = reqProfiles
        .filter((s) => s.exists())
        .map((s) => ({
          uid:      s.id,
          name:     s.data()!.name,
          traceXId: s.data()!.tracexId,
        }));
      setRequests(reqData);

      // Fetch ALL friends in parallel
      const friendProfiles = await Promise.all(
        friendUids.map((uid) => getDoc(doc(db, "users", uid)))
      );
      const friendData: Friend[] = friendProfiles
        .filter((s) => s.exists())
        .map((s) => ({
          uid:      s.id,
          name:     s.data()!.name,
          traceXId: s.data()!.tracexId,
          status:   s.data()!.status || "Offline",
        }));
      setFriends(friendData);
    });
    return () => unsub();
  }, [myUid]);

  // ── Live friend status sync (instant online/offline) ───────
  useEffect(() => {
    if (friends.length === 0) return;

    const unsubs = friends.map((friend) =>
      onSnapshot(doc(db, "users", friend.uid), (snap) => {
        if (!snap.exists()) return;
        const newStatus = snap.data().status || "Offline";
        setFriends((prev) =>
          prev.map((f) =>
            f.uid === friend.uid ? { ...f, status: newStatus } : f
          )
        );
      })
    );

    return () => unsubs.forEach((unsub) => unsub());
  }, [friends.length]);

  // ── Copy TraceX ID ─────────────────────────────────────────
  function handleCopy() {
    navigator.clipboard.writeText(myTraceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Send friend request ────────────────────────────────────
  async function sendRequest() {
    setSearchErr(""); setSearchOk("");
    const id = searchId.trim().toUpperCase();
    if (!id) { setSearchErr("Please enter a TraceX ID."); return; }
    if (id === myTraceId.toUpperCase()) { setSearchErr("You can't add yourself!"); return; }

    const q    = query(collection(db, "users"), where("tracexId", "==", id));
    const snap = await getDocs(q);
    if (snap.empty) { setSearchErr("TraceX ID not found."); return; }

    const targetDoc  = snap.docs[0];
    const targetUid  = targetDoc.id;
    const targetData = targetDoc.data();

    if ((targetData.friends || []).includes(myUid)) {
      setSearchErr("Already friends!"); return;
    }
    if ((targetData.receivedReqs || []).includes(myUid)) {
      setSearchErr("Request already sent."); return;
    }

    await updateDoc(doc(db, "users", targetUid), { receivedReqs: arrayUnion(myUid) });
    await updateDoc(doc(db, "users", myUid!),    { sentReqs:     arrayUnion(targetUid) });

    setSearchOk(`Friend request sent to ${targetData.name}! 🎉`);
    setSearchId("");
  }

  // ── Accept request ─────────────────────────────────────────
  async function acceptRequest(senderUid: string) {
    if (!myUid) return;
    await updateDoc(doc(db, "users", myUid),     { friends: arrayUnion(senderUid),  receivedReqs: arrayRemove(senderUid) });
    await updateDoc(doc(db, "users", senderUid), { friends: arrayUnion(myUid),      sentReqs:     arrayRemove(myUid) });
  }

  // ── Reject request ─────────────────────────────────────────
  async function rejectRequest(senderUid: string) {
    if (!myUid) return;
    await updateDoc(doc(db, "users", myUid),     { receivedReqs: arrayRemove(senderUid) });
    await updateDoc(doc(db, "users", senderUid), { sentReqs:     arrayRemove(myUid) });
  }

  // ── Remove friend ──────────────────────────────────────────
  async function removeFriend(friendUid: string) {
    if (!myUid) return;
    await updateDoc(doc(db, "users", myUid),     { friends: arrayRemove(friendUid) });
    await updateDoc(doc(db, "users", friendUid), { friends: arrayRemove(myUid) });
  }

  // ── Skeleton loader ────────────────────────────────────────
  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Friends" subtitle="Connect, motivate, and study together." />
        <div className="space-y-4 animate-pulse">
          <div className="h-24 rounded-xl bg-slate-800/50" />
          <div className="h-32 rounded-xl bg-slate-800/50" />
          <div className="h-24 rounded-xl bg-slate-800/50" />
          <div className="h-40 rounded-xl bg-slate-800/50" />
        </div>
      </AppShell>
    );
  }

  if (!myUid) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-slate-400">
          Please sign in to use Friends.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Friends"
        subtitle="Connect, motivate, and study together."
      />

      {/* My TraceX ID */}
      <SectionCard title="Your TraceX ID" description="Share this with friends so they can add you.">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-slate-800 px-4 py-2 font-mono text-lg font-bold tracking-widest text-white">
              {myTraceId}
            </span>
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? "Copied! ✓" : "Copy"}
            </Button>
          </div>
          {copied && (
            <p className="text-xs text-green-400 ml-1">
              TraceX ID copied to clipboard!
            </p>
          )}
        </div>
      </SectionCard>

      {/* Add Friend */}
      <SectionCard title="Add Friend by TraceX ID" description="Send a request to connect.">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Enter TraceX ID (e.g. TRX-6GWXWB)"
            value={searchId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchId(e.target.value);
              setSearchErr("");
              setSearchOk("");
            }}
          />
          <Button onClick={sendRequest}>Send Request</Button>
        </div>
        {searchErr && <p className="mt-2 text-xs text-red-400">{searchErr}</p>}
        {searchOk  && <p className="mt-2 text-xs text-green-400">{searchOk}</p>}
      </SectionCard>

      {/* Incoming Requests */}
      <SectionCard title="Requests" description="Approve or reject incoming invites.">
        {requests.length === 0 ? (
          <p className="text-sm text-slate-500">No pending requests.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {requests.map((req) => (
              <div
                key={req.uid}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200"
              >
                <div>
                  <p className="font-semibold">{req.name}</p>
                  <p className="text-xs text-slate-400">{req.traceXId}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => acceptRequest(req.uid)}>Accept</Button>
                  <Button variant="ghost" onClick={() => rejectRequest(req.uid)}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Friends List */}
      <SectionCard title="Friends List" description="Status, session joins, and motivation cards.">
        {friends.length === 0 ? (
          <p className="text-sm text-slate-500">No friends yet. Add someone using their TraceX ID!</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {friends.map((friend) => (
              <div
                key={friend.uid}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200"
              >
                <div>
                  <p className="font-semibold">{friend.name}</p>
                  <p className="text-xs text-slate-400">{friend.traceXId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    friend.status === "Online"
                      ? "bg-green-900/40 text-green-300"
                      : "bg-red-900/20 text-red-400"
                  }`}>
                    {friend.status === "Online" ? "🟢" : "🔴"} {friend.status}
                  </span>
                  <Button variant="ghost" onClick={() => removeFriend(friend.uid)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}