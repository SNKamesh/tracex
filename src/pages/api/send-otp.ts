import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Missing fields" });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"TraceX" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your TraceX Verification Code",
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:32px;background:#0f172a;border-radius:16px;color:white;">
          <h2 style="color:#00d8ff;margin-bottom:8px;">TraceX</h2>
          <p style="color:#94a3b8;">Your verification code is:</p>
          <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:white;margin:24px 0;">${otp}</div>
          <p style="color:#64748b;font-size:13px;">Expires in 10 minutes. Do not share this code.</p>
        </div>
      `,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}