function normalizeHost(value) {
  try {
    const url = new URL(value.includes("://") ? value : "https://" + value);
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function matchesBlockedSite(url, blockedSites) {
  let hostname = "";
  try { hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, ""); } catch { return false; }
  return blockedSites.some((site) => {
    const blockedHost = normalizeHost(site);
    return blockedHost && (hostname === blockedHost || hostname.endsWith("." + blockedHost));
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "TRACEX_GET_BLOCKER_STATE") {
    chrome.storage.sync.get(["blockedSites", "beastMode"], (data) => {
      sendResponse({
        blockedSites: Array.isArray(data.blockedSites) ? data.blockedSites : [],
        beastMode: Boolean(data.beastMode),
      });
    });
    return true;
  }

  if (message?.type === "TRACEX_SET_BLOCKER_STATE") {
    const blockedSites = Array.isArray(message.state?.blockedSites)
      ? [...new Set(message.state.blockedSites.map(normalizeHost).filter(Boolean))].slice(0, 100)
      : [];
    chrome.storage.sync.set({ blockedSites }, () => {
      sendResponse({ success: !chrome.runtime.lastError, error: chrome.runtime.lastError?.message });
    });
    return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;
  if (tab.url.startsWith(chrome.runtime.getURL("blocked.html"))) return;

  chrome.storage.sync.get(["blockedSites", "beastMode"], (data) => {
    const blockedSites = Array.isArray(data.blockedSites) ? data.blockedSites : [];
    const beastMode = Boolean(data.beastMode);
    const isHttpPage = /^https?:\/\//i.test(tab.url);
    const isBlocked = isHttpPage && matchesBlockedSite(tab.url, blockedSites);
    const isAllowedTraceX = /(^|\.)tracex-gdbl\.vercel\.app$/i.test(new URL(tab.url).hostname);

    if (isBlocked || (beastMode && isHttpPage && !isAllowedTraceX)) {
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocked.html") });
    }
  });
});
