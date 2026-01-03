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
  if (days > 0) parts.push(`${days} dag${days !== 1 ? "e" : ""}`);
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
  skiDateInput.addEventListener("change", (e) => {
    const selectedDate = e.target.value;
    setUrlParameter("date", selectedDate);
    startCountdown(selectedDate);
  });
}

// Initialize from URL parameter if present
const urlDate = getUrlParameter("date");
if (urlDate) {
  if (skiDateInput) skiDateInput.value = urlDate;
  startCountdown(urlDate);
}
