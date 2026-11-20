import type { NextApiRequest, NextApiResponse } from "next";
import { getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getAdminDb } from "@/lib/firebaseAdmin";

type ErrorResponse = { error: string };

async function authenticatedUid(req: NextApiRequest): Promise<string | null> {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;
  const db = getAdminDb();
  void db;
  const decoded = await getAuth(getApp()).verifyIdToken(token);
  return decoded.uid;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" } satisfies ErrorResponse);
  }

  try {
    const uid = await authenticatedUid(req);
    if (!uid) return res.status(401).json({ error: "A valid TraceX sign-in token is required." } satisfies ErrorResponse);

    const db = getAdminDb();
    const sessions = db.collection("sessions");

    if (req.method === "GET") {
      const snapshot = await sessions
        .where("userId", "==", uid)
        .orderBy("createdAt", "desc")
        .limit(30)
        .get();

      return res.status(200).json({
        sessions: snapshot.docs.map((document) => ({ id: document.id, ...document.data() })),
      });
    }

    const body = req.body as {
      durationSeconds?: unknown;
      distractions?: unknown;
      worldId?: unknown;
      worldName?: unknown;
      endedAt?: unknown;
    };

    const durationSeconds = Number(body.durationSeconds);
    const distractions = body.distractions === undefined ? 0 : Number(body.distractions);
    if (!Number.isSafeInteger(durationSeconds) || durationSeconds < 1 || durationSeconds > 24 * 60 * 60) {
      return res.status(400).json({ error: "Session duration must be between 1 second and 24 hours." } satisfies ErrorResponse);
    }
    if (!Number.isSafeInteger(distractions) || distractions < 0 || distractions > 10000) {
      return res.status(400).json({ error: "Interruption count must be a non-negative whole number." } satisfies ErrorResponse);
    }

    const endedAt = body.endedAt === undefined ? Date.now() : Number(body.endedAt);
    if (!Number.isFinite(endedAt) || endedAt <= 0 || endedAt > Date.now() + 60_000) {
      return res.status(400).json({ error: "Invalid session end time." } satisfies ErrorResponse);
    }

    const worldId = typeof body.worldId === "string" ? body.worldId.slice(0, 80) : null;
    const worldName = typeof body.worldName === "string" ? body.worldName.slice(0, 100) : null;
    const saved = await sessions.add({
      userId: uid,
      durationSeconds,
      distractions,
      worldId,
      worldName,
      endedAt,
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, id: saved.id });
  } catch (error) {
    console.error("Session API error", error);
    return res.status(500).json({ error: "Could not access session history. Please try again." } satisfies ErrorResponse);
  }
}
