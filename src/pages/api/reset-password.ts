import type { NextApiRequest, NextApiResponse } from "next";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ error: "Missing fields" });

  try {
    const app  = getAdminApp();
    const auth = getAuth(app);
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: newPassword });
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("reset-password error:", err);
    return res.status(500).json({ error: err.message });
  }
}