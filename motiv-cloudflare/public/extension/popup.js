const API_DEFAULT = "http://localhost:3000";

// DOM elements
const authSection = document.getElementById("authSection");
const userBar = document.getElementById("userBar");
const statsSection = document.getElementById("statsSection");
const manualConfig = document.getElementById("manualConfig");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const showManualBtn = document.getElementById("showManualBtn");

// Check if already logged in
chrome.runtime.sendMessage({ type: "get_config" }, (config) => {
  if (config && config.user_token) {
    showLoggedIn(config);
  } else {
    showLoggedOut();
  }
});

function showLoggedIn(config) {
  authSection.classList.add("hidden");
  manualConfig.classList.add("hidden");
  userBar.classList.remove("hidden");
  statsSection.classList.remove("hidden");

  // Set user info
  const email = config.email || config.user_token;
  document.getElementById("userEmail").textContent = email;
  document.getElementById("userAvatar").textContent = (email || "M")[0].toUpperCase();

  // Load stats
  loadStats();
}

function showLoggedOut() {
  authSection.classList.remove("hidden");
  userBar.classList.add("hidden");
  statsSection.classList.add("hidden");
  manualConfig.classList.add("hidden");
}

function loadStats() {
  chrome.runtime.sendMessage({ type: "get_stats" }, (response) => {
    if (response) {
      document.getElementById("totalMinutes").textContent = response.total_minutes || 0;

      const list = document.getElementById("sitesList");
      list.innerHTML = "";
      (response.top_sites || []).forEach(([domain, secs]) => {
        const mins = Math.round(secs / 60);
        if (mins < 1) return;
        const row = document.createElement("div");
        row.className = "site-row";
        row.innerHTML = `<span class="site-name">${domain}</span><span class="site-time">${mins}m</span>`;
        list.appendChild(row);
      });

      if (!response.top_sites?.length) {
        list.innerHTML = '<div style="text-align:center;color:#78716c;font-size:12px;padding:12px">No browsing data yet</div>';
      }
    }
  });
}

// Login button — opens Motiv auth page in a new tab
loginBtn.addEventListener("click", () => {
  // Get API URL from config or use default
  chrome.storage.local.get("motiv_config", (data) => {
    const apiUrl = data.motiv_config?.api_url || API_DEFAULT;
    const authUrl = `${apiUrl}/extension-auth`;

    // Open auth page in a new tab
    chrome.tabs.create({ url: authUrl }, (tab) => {
      // Listen for the auth callback
      const tabId = tab.id;

      // Poll the tab for the auth hash
      const checkInterval = setInterval(() => {
        chrome.tabs.get(tabId, (t) => {
          if (chrome.runtime.lastError || !t) {
            clearInterval(checkInterval);
            return;
          }

          // Check if URL has the auth hash
          if (t.url && t.url.includes("#token=")) {
            clearInterval(checkInterval);

            // Parse the hash params
            const hash = new URL(t.url).hash.substring(1);
            const params = new URLSearchParams(hash);
            const token = params.get("token");
            const userId = params.get("user_id");
            const email = params.get("email");

            if (token && userId) {
              // Save config
              const config = {
                user_token: userId,
                auth_token: token,
                email: email || "",
                api_url: data.motiv_config?.api_url || API_DEFAULT,
              };

              chrome.runtime.sendMessage({
                type: "save_config",
                config,
              }, () => {
                showLoggedIn(config);
                // Close the auth tab
                chrome.tabs.remove(tabId);
              });
            }
          }
        });
      }, 1000);

      // Stop checking after 2 minutes
      setTimeout(() => clearInterval(checkInterval), 120000);
    });
  });
});

// Logout button
logoutBtn.addEventListener("click", () => {
  chrome.storage.local.remove("motiv_config", () => {
    showLoggedOut();
  });
});

// Show manual config
showManualBtn.addEventListener("click", () => {
  manualConfig.classList.toggle("hidden");
});

// Manual save config
document.getElementById("saveBtn").addEventListener("click", () => {
  const token = document.getElementById("tokenInput").value.trim();
  const apiUrl = document.getElementById("apiInput").value.trim();
  const status = document.getElementById("statusMsg");

  if (!token) {
    status.textContent = "User ID is required";
    status.className = "status error";
    return;
  }

  const config = {
    user_token: token,
    api_url: apiUrl || API_DEFAULT,
  };

  chrome.runtime.sendMessage({
    type: "save_config",
    config,
  }, (response) => {
    if (response?.saved) {
      status.textContent = "Connected!";
      status.className = "status";
      showLoggedIn(config);
    }
  });
});
