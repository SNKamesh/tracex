import type { NextApiRequest, NextApiResponse } from "next"
import { addClient, getState, removeClient } from "@/lib/syncStore"

export const config = {
  api: {
    bodyParser: false
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive"
  })

  res.write(`data: ${JSON.stringify(getState())}\n\n`)
  addClient(res)

  req.on("close", () => {
    removeClient(res)
  })
}
