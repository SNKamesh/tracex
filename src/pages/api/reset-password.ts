import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ error: "Missing fields" });

  try {
    // Handle all possible private key formats from Vercel
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";

    // If it has literal \n strings, replace with real newlines
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    // If it's wrapped in quotes, remove them
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }

    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");

    const app = getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert({
            projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          }),
        });

    const auth = getAuth(app);
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: newPassword });
    return res.status(200).json({ ok: true });

  } catch (err: any) {
    console.error("reset-password error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}