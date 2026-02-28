const matchesBlocked = (url, blocked) => {
  if (!url) return false
  return blocked.some((entry) => url.includes(entry))
}

const enforceBlock = async (tabId, url) => {
  const { blocked = [] } = await chrome.storage.local.get("blocked")
  if (matchesBlocked(url, blocked)) {
    await chrome.tabs.update(tabId, { url: "chrome://newtab" })
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    enforceBlock(tabId, tab.url)
  }
})
