import type { NextApiRequest, NextApiResponse } from "next";

type SuccessResponse = {
  status: "ok";
  message: string;
};

type ErrorResponse = {
  error: string;
};

type OtpRecord = {
  code: string;
  expiresAt: number;
};

const OTP_TTL_MS = 5 * 60 * 1000;
const otpStore = new Map<string, OtpRecord>();

function otpKey(channel: "phone" | "email", target: string) {
  return `${channel}:${target.trim().toLowerCase()}`;
}

function makeOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSmsOtp(phone: string, code: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    return {
      sent: false,
      message:
        "SMS service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER.",
    };
  }

  const body = new URLSearchParams({
    From: from,
    To: phone,
    Body: `Your TraceX OTP is ${code}. It expires in 5 minutes.`,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    return { sent: false, message: `Failed to send SMS OTP (${response.status}): ${text}` };
  }

  return { sent: true, message: "OTP sent successfully" };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { action, channel, target, otp } = req.body as {
    action?: "send_otp" | "verify_otp";
    channel?: "phone" | "email";
    target?: string;
    otp?: string;
  };

  if (!action || !channel || !target) {
    res.status(400).json({ error: "Missing action, channel or target" });
    return;
  }

  if (!["phone", "email"].includes(channel)) {
    res.status(400).json({ error: "Unsupported channel" });
    return;
  }

  const key = otpKey(channel, target);

  if (action === "send_otp") {
    const code = makeOtp();
    otpStore.set(key, { code, expiresAt: Date.now() + OTP_TTL_MS });

    if (channel === "phone") {
      try {
        const smsResult = await sendSmsOtp(target, code);
        if (!smsResult.sent) {
          res.status(503).json({ error: smsResult.message });
          return;
        }
      } catch (error) {
        res.status(500).json({ error: "Unexpected SMS provider error" });
        return;
      }
    }

    if (process.env.NODE_ENV !== "production") {
      // Helpful for local testing until a real SMS/email provider is configured.
      console.info(`[traceX otp] ${channel}:${target} -> ${code}`);
    }

    res.status(200).json({ status: "ok", message: "OTP sent" });
    return;
  }

  if (action === "verify_otp") {
    if (!otp) {
      res.status(400).json({ error: "OTP is required" });
      return;
    }

    const record = otpStore.get(key);
    if (!record) {
      res.status(400).json({ error: "No OTP request found. Please request OTP first." });
      return;
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      res.status(400).json({ error: "OTP expired. Please request a new OTP." });
      return;
    }

    if (record.code !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    otpStore.delete(key);
    res.status(200).json({ status: "ok", message: "OTP verified" });
    return;
  }
  res.status(400).json({ error: "Unsupported action" });
}