// public/js/themeLoader.js

// This script runs as early as possible to prevent theme flickering
(function () {
  // First check for user preference from the server (from data-user-theme attribute)
  const userTheme = document.documentElement.getAttribute("data-user-theme");

  // Then check localStorage in case the user changed it client-side
  const localTheme = localStorage.getItem("theme");

  // Determine the theme to use (prioritize localStorage over server)
  let themeToApply = "light"; // Default theme

  if (localTheme) {
    // If there's a theme in localStorage, use that
    themeToApply = localTheme;
  } else if (userTheme) {
    // Otherwise use the user's theme from the server
    themeToApply = userTheme;
  }

  // Apply the theme to both html and body
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(themeToApply);

  // Also add to body if it exists (might not yet during initial page load)
  if (document.body) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(themeToApply);
  } else {
    // If body doesn't exist yet, wait for it
    document.addEventListener("DOMContentLoaded", function () {
      document.body.classList.remove("light", "dark");
      document.body.classList.add(themeToApply);
    });
  }

  // Also store the theme for future use
  localStorage.setItem("theme", themeToApply);

  // Log for debugging
  console.log("Theme loader applied:", themeToApply);
})();
