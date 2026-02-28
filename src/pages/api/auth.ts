import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    res.status(200).json({
      status: "ok",
      message: "Auth placeholder",
      otpRequired: true,
      passkeyAvailable: true
    })
    return
  }
  res.status(405).json({ error: "Method not allowed" })
}
