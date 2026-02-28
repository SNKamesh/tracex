const input = document.getElementById("siteInput")
const saveBtn = document.getElementById("saveBtn")
const syncBtn = document.getElementById("syncBtn")

saveBtn.addEventListener("click", async () => {
  const value = input.value.trim()
  if (!value) return
  const { blocked = [] } = await chrome.storage.local.get("blocked")
  const next = Array.from(new Set([...blocked, value]))
  await chrome.storage.local.set({ blocked: next })
  input.value = ""
})

syncBtn.addEventListener("click", async () => {
  try {
    await fetch("http://localhost:3000/api/sync")
  } catch {
    undefined
  }
})
