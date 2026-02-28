import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    res.status(200).json({
      status: "ok",
      message: "Conversion queued",
      premiumRequired: false
    })
    return
  }
  res.status(405).json({ error: "Method not allowed" })
}
