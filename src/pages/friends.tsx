import AppShell from "@/components/AppShell"
import Button from "@/components/Button"
import Input from "@/components/Input"
import PageHeader from "@/components/PageHeader"
import SectionCard from "@/components/SectionCard"

const requests = ["TRX9L2KQ8P", "TRX4N7ZJ3M"]
const friends = [
  { id: "TRX1A8ZQ5K", name: "Riya", status: "Online" },
  { id: "TRX7F2M9H1", name: "Jay", status: "Offline" }
]

export default function Friends() {
  return (
    <AppShell>
      <PageHeader title="Friends" subtitle="Connect, motivate, and study together." />
      <SectionCard title="Add Friend by TraceX ID" description="Send a request to connect.">
        <div className="flex flex-wrap gap-3">
          <Input placeholder="Enter TraceX ID" />
          <Button>Send Request</Button>
        </div>
      </SectionCard>
      <SectionCard title="Requests" description="Approve or reject incoming invites.">
        <div className="grid gap-3 md:grid-cols-2">
          {requests.map((id) => (
            <div
              key={id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200"
            >
              <span>{id}</span>
              <div className="flex gap-2">
                <Button>Accept</Button>
                <Button variant="ghost">Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Friends List" description="Status, session joins, and motivation cards.">
        <div className="grid gap-3 md:grid-cols-2">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200"
            >
              <div>
                <p className="font-semibold">{friend.name}</p>
                <p className="text-xs text-slate-400">{friend.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip">{friend.status}</span>
                <Button variant="secondary">Join Session</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary">Send Motivation Card</Button>
          <Button variant="secondary">Share Study Plan</Button>
        </div>
      </SectionCard>
    </AppShell>
  )
}
