"use client";

import { useEffect, useState }from "react";
import { User } from "firebase/auth";
import { db, auth } from "@/lib/firebase"; // Assuming centralized Firebase
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  setDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";

import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";

// More descriptive and reusable types
interface UserProfile {
  uid: string;
  name: string;
  traceXId: string;
  status?: "Online" | "Offline";
}

interface Friend extends UserProfile {}
interface FriendRequest extends UserProfile {}

/**
 * Efficiently fetches user profiles in batches of up to 30.
 * @param uids - Array of user UIDs to fetch.
 * @returns A map of UID to UserProfile.
 */
async function fetchProfiles(uids: string[]): Promise<Map<string, UserProfile>> {
  const profiles = new Map<string, UserProfile>();
  if (uids.length === 0) return profiles;

  // Firestore 'in' queries are limited to 30 items per query.
  for (let i = 0; i < uids.length; i += 30) {
    const chunk = uids.slice(i, i + 30);
    const q = query(collection(db, "users"), where("uid", "in", chunk));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const data = doc.data();
      profiles.set(doc.id, {
        uid: doc.id,
        name: data.name,
        traceXId: data.traceXId,
        status: data.status,
      });
    });
  }
  return profiles;
}

export default function FriendsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]); // Store UIDs of users I've sent requests to

  const [loading, setLoading] = useState(true);

  // Search state
  const [searchId, setSearchId] = useState("");
  const [searchErr, setSearchErr] = useState("");
  const [searchOk, setSearchOk] = useState("");

  // Main listener for auth state and user profile
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setMyProfile({ uid: user.uid, ...data } as UserProfile);
        }
      } else {
        setCurrentUser(null);
        setMyProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listener for friends, incoming requests, and sent requests
  useEffect(() => {
    if (!myProfile) return;

    const userRef = doc(db, "users", myProfile.uid);
    const unsubscribe = onSnapshot(userRef, async (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      const friendUIDs = data.friends || [];
      const receivedReqUIDs = data.receivedReqs || [];
      
      setSentRequests(data.sentReqs || []);

      const [friendProfiles, requestProfiles] = await Promise.all([
        fetchProfiles(friendUIDs),
        fetchProfiles(receivedReqUIDs),
      ]);

      setFriends(Array.from(friendProfiles.values()));
      setRequests(Array.from(requestProfiles.values()));
    });

    return () => unsubscribe();
  }, [myProfile]);
  
  async function sendRequest() {
    setSearchErr("");
    setSearchOk("");
    if (!myProfile) return;

    const id = searchId.trim().toUpperCase();
    if (!id) {
      setSearchErr("Please enter a TraceX ID.");
      return;
    }
    if (id === myProfile.traceXId) {
      setSearchErr("You can't add yourself!");
      return;
    }

    const q = query(collection(db, "users"), where("tracexId", "==", id));
    const snap = await getDocs(q);
    if (snap.empty) {
      setSearchErr("TraceX ID not found.");
      return;
    }

    const targetUserDoc = snap.docs[0];
    const targetUid = targetUserDoc.id;
    const targetData = targetUserDoc.data();

    if ((myProfile as any).friends?.includes(targetUid)) {
      setSearchErr("You are already friends!");
      return;
    }
    if (sentRequests.includes(targetUid)) {
      setSearchErr("Request already sent.");
      return;
    }
     if (requests.some(req => req.uid === targetUid)) {
      setSearchErr("This user has already sent you a request. Check your requests list.");
      return;
    }

    const batch = writeBatch(db);
    batch.update(doc(db, "users", targetUid), { receivedReqs: arrayUnion(myProfile.uid) });
    batch.update(doc(db, "users", myProfile.uid), { sentReqs: arrayUnion(targetUid) });
    await batch.commit();

    setSearchOk(`Friend request sent to ${targetData.name}! 🎉`);
    setSearchId("");
  }
  
  async function acceptRequest(senderUid: string) {
    if (!myProfile) return;
    const batch = writeBatch(db);

    // My user doc: add to friends, remove from receivedReqs
    batch.update(doc(db, "users", myProfile.uid), {
      friends: arrayUnion(senderUid),
      receivedReqs: arrayRemove(senderUid),
    });

    // Sender's user doc: add to friends, remove from sentReqs
    batch.update(doc(db, "users", senderUid), {
      friends: arrayUnion(myProfile.uid),
      sentReqs: arrayRemove(myProfile.uid),
    });
    
    await batch.commit();
  }

  async function rejectRequest(senderUid: string) {
    if (!myProfile) return;
    const batch = writeBatch(db);
    // My user doc: remove from receivedReqs
    batch.update(doc(db, "users", myProfile.uid), { receivedReqs: arrayRemove(senderUid) });
    // Sender's user doc: remove from sentReqs
    batch.update(doc(db, "users", senderUid), { sentReqs: arrayRemove(myProfile.uid) });
    await batch.commit();
  }

  async function removeFriend(friendUid: string) {
    if (!myProfile) return;
    const batch = writeBatch(db);
    // My user doc: remove from friends
    batch.update(doc(db, "users", myProfile.uid), { friends: arrayRemove(friendUid) });
    // Friend's user doc: remove from friends
    batch.update(doc(db, "users", friendUid), { friends: arrayRemove(myProfile.uid) });
    await batch.commit();
  }
  
  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>
      </AppShell>
    );
  }

  if (!currentUser || !myProfile) {
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

      <SectionCard title="Your TraceX ID" description="Share this with friends so they can add you.">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-slate-800 px-4 py-2 font-mono text-lg font-bold tracking-widest text-white">
            {myProfile.traceXId}
          </span>
          <Button
            variant="secondary"
            onClick={() => { navigator.clipboard.writeText(myProfile.traceXId); }}
          >
            Copy
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Add Friend by TraceX ID" description="Send a request to connect.">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Enter TraceX ID (e.g. TRXAB12CD)"
            value={searchId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearchId(e.target.value); setSearchErr(""); setSearchOk(""); }}
          />
          <Button onClick={sendRequest}>Send Request</Button>
        </div>
        {searchErr && <p className="mt-2 text-xs text-red-400">{searchErr}</p>}
        {searchOk  && <p className="mt-2 text-xs text-green-400">{searchOk}</p>}
      </SectionCard>
      
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
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      friend.status === "Online"
                        ? "bg-green-900 text-green-300"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {friend.status}
                  </span>
                  <Button variant="secondary">Join Session</Button>
                  <Button variant="ghost" onClick={() => removeFriend(friend.uid)}>Remove</Button>
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