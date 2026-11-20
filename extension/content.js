// The bridge is intentionally enabled only on the TraceX production website.
if (window.location.hostname === "tracex-gdbl.vercel.app") {
  const bridgeSource = "tracex-web";

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== window.location.origin) return;
    const message = event.data;
    if (!message || message.source !== bridgeSource) return;

    if (message.type === "GET_BLOCKER_STATE") {
      chrome.runtime.sendMessage({ type: "TRACEX_GET_BLOCKER_STATE" }, (state) => {
        if (chrome.runtime.lastError) return;
        window.postMessage({ source: "tracex-extension", type: "BLOCKER_STATE", state }, window.location.origin);
      });
    }

    if (message.type === "SET_BLOCKER_STATE") {
      chrome.runtime.sendMessage({ type: "TRACEX_SET_BLOCKER_STATE", state: message.state }, (result) => {
        if (chrome.runtime.lastError) return;
        if (result?.success) {
          window.postMessage({ source: "tracex-extension", type: "SYNC_SAVED" }, window.location.origin);
        }
      });
    }
  });

  window.postMessage({ source: "tracex-extension", type: "READY" }, window.location.origin);
}
