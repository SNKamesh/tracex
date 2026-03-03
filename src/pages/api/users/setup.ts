import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminDb } from "@/lib/firebaseAdmin";

function generateTraceXId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "TRX";
  for (let i = 0; i < 7; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  
  const { uid, name, studyType, email } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing uid" });

  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();

  // If user already exists return their data
  if (snap.exists) return res.status(200).json(snap.data());

  // Generate unique TraceX ID
  let traceId = generateTraceXId();
  // Make sure it's unique
  const existing = await db.collection("users").where("traceId", "==", traceId).get();
  if (!existing.empty) traceId = generateTraceXId();

  const userData = {
    uid,
    name: name || "Scholar",
    studyType: studyType || "Other",
    email: email || "",
    traceId,
    friends: [],
    requests: [],
    createdAt: Date.now(),
  };

  await ref.set(userData);
  return res.status(200).json(userData);
}