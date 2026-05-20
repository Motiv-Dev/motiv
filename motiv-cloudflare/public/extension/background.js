// Motiv Browser Extension — Background Service Worker
// Tracks screen time per domain + detects adult content domains

const ADULT_DOMAINS = [
  "pornhub", "xvideos", "xnxx", "redtube", "youporn", "xhamster",
  "brazzers", "bangbros", "realitykings", "naughtyamerica", "mofos",
  "tube8", "spankbang", "eporner", "hqporner", "txxx", "lobstertube",
  "thumbzilla", "porntrex", "beeg", "porn", "xxx", "hentai",
  "rule34", "nhentai", "hanime", "fakku", "chaturbate", "stripchat",
  "livejasmin", "bongacams", "cam4", "myfreecams", "onlyfans",
];

// State
let activeTabId = null;
let activeUrl = "";
let lastTick = Date.now();

// Initialize daily tracking
async function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function getScreenTime() {
  const key = await getTodayKey();
  const data = await chrome.storage.local.get(key);
  return data[key] || {};
}

async function saveScreenTime(domainTimes) {
  const key = await getTodayKey();
  await chrome.storage.local.set({ [key]: domainTimes });
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

function isAdultDomain(domain) {
  if (!domain) return false;
  const lower = domain.toLowerCase();
  return ADULT_DOMAINS.some(ad => lower.includes(ad));
}

// Track time on active tab
async function tickTime() {
  const now = Date.now();
  const elapsed = Math.round((now - lastTick) / 1000); // seconds
  lastTick = now;

  if (!activeUrl || elapsed > 300) return; // Skip if idle > 5 min

  const domain = getDomain(activeUrl);
  if (!domain) return;

  const times = await getScreenTime();
  times[domain] = (times[domain] || 0) + elapsed;
  await saveScreenTime(times);
}

// Tab change listeners
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await tickTime();
  activeTabId = activeInfo.tabId;
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    activeUrl = tab.url || "";
    checkForViolation(activeUrl);
  } catch {}
  lastTick = Date.now();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (tabId === activeTabId && changeInfo.url) {
    await tickTime();
    activeUrl = changeInfo.url;
    checkForViolation(activeUrl);
    lastTick = Date.now();
  }
});

// Check for adult content violation
async function checkForViolation(url) {
  const domain = getDomain(url);
  if (!domain || !isAdultDomain(domain)) return;

  const config = await chrome.storage.local.get("motiv_config");
  const token = config.motiv_config?.user_token;
  const apiUrl = config.motiv_config?.api_url || "http://localhost:3000";

  if (!token) return;

  // Report violation to Motiv API
  try {
    await fetch(`${apiUrl}/api/verify/extension`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_token: token,
        type: "browsing_violation",
        data: { domain, url, timestamp: new Date().toISOString() },
      }),
    });
  } catch {}

  // Show warning notification
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon128.png",
    title: "Motiv — Violation Detected",
    message: `Adult content detected. Your daily stake has been burned.`,
    priority: 2,
  });
}

// Periodic tick every 30 seconds
chrome.alarms.create("tick", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "tick") {
    await tickTime();
  }
  if (alarm.name === "daily_report") {
    await sendDailyReport();
  }
});

// Daily report at midnight
chrome.alarms.create("daily_report", {
  when: getNextMidnight(),
  periodInMinutes: 24 * 60,
});

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

async function sendDailyReport() {
  const config = await chrome.storage.local.get("motiv_config");
  const token = config.motiv_config?.user_token;
  const apiUrl = config.motiv_config?.api_url || "http://localhost:3000";

  if (!token) return;

  const times = await getScreenTime();
  const totalSeconds = Object.values(times).reduce((sum, s) => sum + s, 0);

  try {
    await fetch(`${apiUrl}/api/verify/extension`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_token: token,
        type: "screentime_report",
        data: {
          total_minutes: Math.round(totalSeconds / 60),
          breakdown: Object.fromEntries(
            Object.entries(times).map(([domain, secs]) => [domain, Math.round(secs / 60)])
          ),
        },
      }),
    });
  } catch {}
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "get_stats") {
    getScreenTime().then(times => {
      const totalSeconds = Object.values(times).reduce((sum, s) => sum + s, 0);
      const sorted = Object.entries(times)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      sendResponse({ total_minutes: Math.round(totalSeconds / 60), top_sites: sorted });
    });
    return true;
  }
  if (msg.type === "save_config") {
    chrome.storage.local.set({ motiv_config: msg.config }).then(() => {
      sendResponse({ saved: true });
    });
    return true;
  }
  if (msg.type === "get_config") {
    chrome.storage.local.get("motiv_config").then(data => {
      sendResponse(data.motiv_config || {});
    });
    return true;
  }
});
