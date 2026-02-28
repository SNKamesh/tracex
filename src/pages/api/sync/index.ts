import type { NextApiRequest, NextApiResponse } from "next"
import { getState, updateState } from "@/lib/syncStore"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.status(200).json(getState())
    return
  }

  if (req.method === "POST") {
    const next = updateState(req.body ?? {})
    res.status(200).json(next)
    return
  }

  res.status(405).json({ error: "Method not allowed" })
}
