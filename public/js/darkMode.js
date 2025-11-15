// Dark Mode Toggle Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Create the dark mode toggle button
  createDarkModeToggle();

  // Initialize dark mode based on user preference
  initDarkMode();
});

function createDarkModeToggle() {
  // Create button element
  const toggleButton = document.createElement("button");
  toggleButton.className = "dark-mode-toggle";
  toggleButton.id = "darkModeToggle";
  toggleButton.setAttribute("aria-label", "Toggle dark mode");
  toggleButton.setAttribute("title", "Toggle dark mode");

  // Add icon
  toggleButton.innerHTML = '<i class="bi bi-moon-fill"></i>';

  // Append to body
  document.body.appendChild(toggleButton);

  // Add click event
  toggleButton.addEventListener("click", toggleDarkMode);
}

function initDarkMode() {
  // Check for saved preference
  const darkModeSaved = localStorage.getItem("darkMode") === "true";

  // Check for system preference if no saved preference
  const systemPrefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Apply dark mode if needed
  if (
    darkModeSaved ||
    (systemPrefersDark && localStorage.getItem("darkMode") === null)
  ) {
    applyDarkMode();
  } else {
    applyLightMode();
  }
}

function toggleDarkMode() {
  if (document.body.classList.contains("dark-mode")) {
    applyLightMode();
    localStorage.setItem("darkMode", "false");
  } else {
    applyDarkMode();
    localStorage.setItem("darkMode", "true");
  }
}

function applyDarkMode() {
  document.body.classList.add("dark-mode");
  const toggleButton = document.getElementById("darkModeToggle");
  if (toggleButton) {
    toggleButton.innerHTML = '<i class="bi bi-sun-fill"></i>';
    toggleButton.setAttribute("title", "Switch to light mode");
  }
}

function applyLightMode() {
  document.body.classList.remove("dark-mode");
  const toggleButton = document.getElementById("darkModeToggle");
  if (toggleButton) {
    toggleButton.innerHTML = '<i class="bi bi-moon-fill"></i>';
    toggleButton.setAttribute("title", "Switch to dark mode");
  }
}
