const skiDateInput = document.getElementById("skiDate");
const countdownContainer = document.getElementById("countdownContainer");
const countdownDisplay = document.getElementById("countdown");
let countdownInterval;

// Function to get URL parameters
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Function to set URL parameter
function setUrlParameter(name, value) {
  const url = new URL(window.location);
  if (value) {
    url.searchParams.set(name, value);
  } else {
    url.searchParams.delete(name);
  }
  window.history.replaceState({}, "", url);
}

// Function to format time difference
function formatTimeDifference(ms) {
  if (ms <= 0) {
    return "Tid til at tage af sted! 🎿";
  }

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  let parts = [];
  if (days > 0) parts.push(`${days} døgn`);
  if (remainingHours > 0)
    parts.push(`${remainingHours} time${remainingHours !== 1 ? "r" : ""}`);
  if (remainingMinutes > 0)
    parts.push(
      `${remainingMinutes} minut${remainingMinutes !== 1 ? "ter" : ""}`
    );
  if (days === 0 && remainingHours === 0) {
    parts.push(
      `${remainingSeconds} sekund${remainingSeconds !== 1 ? "er" : ""}`
    );
  }

  return parts.join(", ");
}

// Function to update countdown
function updateCountdown(targetDate) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  countdownDisplay.textContent = formatTimeDifference(difference);

  if (difference <= 0 && countdownInterval) {
    clearInterval(countdownInterval);
  }
}

// Function to start countdown
function startCountdown(dateTimeString) {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  if (dateTimeString) {
    countdownContainer.classList.remove("hidden");
    updateCountdown(dateTimeString);
    countdownInterval = setInterval(
      () => updateCountdown(dateTimeString),
      1000
    );
  } else {
    countdownContainer.classList.add("hidden");
  }
}

// Event listener for date input
if (skiDateInput) {
  // ensure time defaults to 17:00 if user picks only a date
  skiDateInput.addEventListener("change", (e) => {
    let selectedDate = e.target.value;
    if (selectedDate) {
      selectedDate = ensureDateHasTime(selectedDate, 17);
      // update input in case we appended a time
      skiDateInput.value = selectedDate;
      setUrlParameter("date", selectedDate);
      saveDateToCache(selectedDate);
      startCountdown(selectedDate);
    } else {
      setUrlParameter("date", null);
      removeDateFromCache();
      startCountdown(null);
    }
    updateShareButtonState();
  });

  // on first focus, if empty, prefill a default time (17:00) for convenience
  skiDateInput.addEventListener("focus", () => {
    if (!skiDateInput.value) {
      const def = getDefaultDateTimeAtHour(17);
      skiDateInput.value = def;
      updateShareButtonState();
    }
  });
}

// Initialize from URL parameter if present
const urlDate = getUrlParameter("date");
if (urlDate) {
  if (skiDateInput) skiDateInput.value = ensureDateHasTime(urlDate, 17);
  // cache the URL date so it persists between visits
  saveDateToCache(skiDateInput.value);
  startCountdown(skiDateInput.value);
}

// If no date in URL, check cache and restore (then update URL)
if (!urlDate) {
  const cached = getDateFromCache();
  if (cached) {
    const withTime = ensureDateHasTime(cached, 17);
    setUrlParameter("date", withTime);
    if (skiDateInput) skiDateInput.value = withTime;
    startCountdown(withTime);
  }
}

// Ensure a date string includes a time; append defaultHour if missing
function ensureDateHasTime(dateStr, defaultHour = 17) {
  if (!dateStr) return dateStr;
  // If already has time part (THH or T HH), keep it; normalize to HH:MM
  if (dateStr.includes("T")) {
    const parts = dateStr.split("T");
    if (parts[1] && /^\d{2}:\d{2}/.test(parts[1]))
      return `${parts[0]}T${parts[1].slice(0, 5)}`;
    // if time part is missing or incomplete, append default
    return `${parts[0]}T${String(defaultHour).padStart(2, "0")}:00`;
  }
  // date-only string: append time
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr}T${String(defaultHour).padStart(2, "0")}:00`;
  }
  return dateStr;
}

// get today's date at given hour in local timezone formatted for datetime-local
function getDefaultDateTimeAtHour(hour = 17) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  return `${year}-${month}-${day}T${hh}:00`;
}

// --- Share button logic ---
const shareBtn = document.getElementById("shareBtn");
const shareMsg = document.getElementById("shareMessage");

function showShareMessage(text, ms = 2000) {
  if (!shareMsg) return;
  shareMsg.textContent = text;
  shareMsg.classList.remove("hidden");
  clearTimeout(showShareMessage._t);
  showShareMessage._t = setTimeout(() => {
    shareMsg.classList.add("hidden");
  }, ms);
}

function updateShareButtonState() {
  if (!shareBtn) return;
  const hasDate = (skiDateInput && skiDateInput.value) || getDateFromCache();
  shareBtn.disabled = !hasDate;
}

async function fallbackCopy(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showShareMessage("Link kopieret til udklipsholder");
  } catch (e) {
    showShareMessage("Kunne ikke kopiere link");
  }
}

if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    const dateVal = (skiDateInput && skiDateInput.value) || getDateFromCache();
    if (!dateVal) {
      showShareMessage("Vælg først en dato for at dele");
      return;
    }

    const shareUrl = new URL(window.location);
    shareUrl.searchParams.set("date", dateVal);
    const finalUrl = shareUrl.toString();

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Skal jeg på ski?",
          text: "Skitur!",
          url: finalUrl,
        });
        showShareMessage("Delt!");
        return;
      } catch (e) {
        // user cancelled or failed, fall back to clipboard
      }
    }

    // Try clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(finalUrl);
        showShareMessage("Link kopieret til udklipsholder");
        return;
      } catch (e) {
        // fallback
      }
    }

    fallbackCopy(finalUrl);
  });
}

// Update share button state on input change and initial run
if (skiDateInput) {
  skiDateInput.addEventListener("change", () => updateShareButtonState());
}
updateShareButtonState();

/* Cache helpers (use localStorage if available) */
function isLocalStorageAvailable() {
  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

function saveDateToCache(dateStr) {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem("skiDate", dateStr);
  } catch (e) {
    // ignore quota errors
  }
}

function getDateFromCache() {
  if (!isLocalStorageAvailable()) return null;
  try {
    const v = localStorage.getItem("skiDate");
    return v;
  } catch (e) {
    return null;
  }
}

function removeDateFromCache() {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.removeItem("skiDate");
  } catch (e) {
    // ignore
  }
}
