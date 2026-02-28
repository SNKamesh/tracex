chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url) return;

  chrome.storage.sync.get(["blockedSites", "beastMode"], (data) => {
    const blockedSites = data.blockedSites || [];
    const beastMode = data.beastMode || false;

    // Check if the site matches any blocked pattern
    const isBlocked = blockedSites.some((site) => tab.url.includes(site));

    if (isBlocked) {
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL("blocked.html")
      });
    }

    // Beast mode: block everything except TraceX
    if (beastMode) {
      if (!tab.url.includes("tracex")) {
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL("blocked.html")
        });
      }
    }
  });
});