import { useEffect, useMemo, useState } from "react"
import Button from "@/components/Button"
import Input from "@/components/Input"

type PlanItem = {
  id: string
  title: string
  duration: string
}

export default function StudyPlanList() {
  const [items, setItems] = useState<PlanItem[]>([])
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState("")

  const sortedItems = useMemo(() => items, [items])

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/sync")
      const data = await res.json()
      if (data?.studyPlan) setItems(data.studyPlan)
    }
    load()
    const stream = new EventSource("/api/sync/stream")
    stream.onmessage = (event) => {
      try {
        const next = JSON.parse(event.data)
        if (next?.studyPlan) setItems(next.studyPlan)
      } catch {
        setItems((prev) => prev)
      }
    }
    return () => {
      stream.close()
    }
  }, [])

  const syncPlan = async (nextItems: PlanItem[]) => {
    await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studyPlan: nextItems })
    })
  }

  const addItem = () => {
    if (!title.trim() || !duration.trim()) return
    const nextItems = [
      ...items,
      { id: Math.random().toString(36).slice(2, 8), title, duration }
    ]
    setItems(nextItems)
    syncPlan(nextItems)
    setTitle("")
    setDuration("")
  }

  const removeItem = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id)
    setItems(nextItems)
    syncPlan(nextItems)
  }

  const moveItem = (id: string, direction: "up" | "down") => {
    const index = items.findIndex((item) => item.id === id)
    if (index < 0) return
    const nextIndex = direction === "up" ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= items.length) return
    const updated = [...items]
    const [removed] = updated.splice(index, 1)
    updated.splice(nextIndex, 0, removed)
    setItems(updated)
    syncPlan(updated)
  }


  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
        <Input placeholder="Plan title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          placeholder="Duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <Button onClick={addItem}>Add</Button>
      </div>
      <div className="space-y-3">
        {sortedItems.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="text-xs text-slate-400">{item.duration}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Button variant="secondary" onClick={() => moveItem(item.id, "up")} disabled={index === 0}>
                Up
              </Button>
              <Button
                variant="secondary"
                onClick={() => moveItem(item.id, "down")}
                disabled={index === items.length - 1}
              >
                Down
              </Button>
              <Button variant="ghost" onClick={() => removeItem(item.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        Study Plan updates sync instantly across devices via TraceX Sync.
      </p>
    </div>
  )
}
