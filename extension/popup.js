const siteInput = document.getElementById("siteInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("siteList");
const beastToggle = document.getElementById("beastToggle");

// Load existing data
chrome.storage.sync.get(["blockedSites", "beastMode"], (data) => {
  const blockedSites = data.blockedSites || [];
  beastToggle.checked = data.beastMode || false;

  blockedSites.forEach((site) => addToList(site));
});

function addToList(site) {
  const li = document.createElement("li");
  li.textContent = site;
  list.appendChild(li);
}

// Add a blocked site
addBtn.onclick = () => {
  const site = siteInput.value.trim();
  if (!site) return;

  chrome.storage.sync.get(["blockedSites"], (data) => {
    const updated = [...(data.blockedSites || []), site];
    chrome.storage.sync.set({ blockedSites: updated });

    addToList(site);
    siteInput.value = "";
  });
};

// Beast mode toggle
beastToggle.onchange = () => {
  chrome.storage.sync.set({ beastMode: beastToggle.checked });
};