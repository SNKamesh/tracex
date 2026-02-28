import { NextApiResponse } from "next"

export type PlanItem = {
  id: string
  title: string
  duration: string
}

export type SyncState = {
  studyPlan: PlanItem[]
  theme: string
  updatedAt: string
}

type Client = NextApiResponse

type Store = {
  state: SyncState
  clients: Set<Client>
}

const globalStore = globalThis as typeof globalThis & {
  __tracexStore?: Store
}

const defaultState: SyncState = {
  studyPlan: [
    { id: "1", title: "Deep work: Algebra practice", duration: "60 min" },
    { id: "2", title: "Quick review: Chemistry notes", duration: "25 min" },
    { id: "3", title: "Mock test: Competitive set", duration: "45 min" }
  ],
  theme: "AMOLED Black",
  updatedAt: new Date().toISOString()
}

const store: Store =
  globalStore.__tracexStore ?? {
    state: defaultState,
    clients: new Set()
  }

globalStore.__tracexStore = store

export const getState = () => store.state

export const updateState = (next: Partial<SyncState>) => {
  store.state = { ...store.state, ...next, updatedAt: new Date().toISOString() }
  broadcast(store.state)
  return store.state
}

export const addClient = (res: Client) => {
  store.clients.add(res)
}

export const removeClient = (res: Client) => {
  store.clients.delete(res)
}

const broadcast = (state: SyncState) => {
  const data = `data: ${JSON.stringify(state)}\n\n`
  store.clients.forEach((client) => {
    try {
      client.write(data)
    } catch {
      store.clients.delete(client)
    }
  })
}
