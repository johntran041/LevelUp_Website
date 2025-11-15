// public/js/setTheme.js

document.addEventListener("DOMContentLoaded", () => {
  const radios = document.querySelectorAll('input[name="theme"]');
  const body = document.body;
  const html = document.documentElement;
  const userId = body.dataset.userId;

  // Set the correct radio button based on current theme (from localStorage or body class)
  const currentTheme =
    localStorage.getItem("theme") || body.classList.contains("dark")
      ? "dark"
      : "light";
  const themeRadio = document.querySelector(
    `input[name="theme"][value="${currentTheme}"]`
  );
  if (themeRadio) {
    themeRadio.checked = true;
  }

  // Add event listeners to radio buttons
  radios.forEach((radio) => {
    radio.addEventListener("change", async (e) => {
      const selectedTheme = e.target.value;

      // Apply theme to HTML and body elements
      html.classList.remove("light", "dark");
      html.classList.add(selectedTheme);

      body.classList.remove("light", "dark");
      body.classList.add(selectedTheme);

      // Save to localStorage for persistence across pages
      localStorage.setItem("theme", selectedTheme);

      // Save to server if user is logged in
      if (userId) {
        try {
          const res = await fetch(`/userSettings/display/update/${userId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ theme: selectedTheme }),
          });

          if (!res.ok) throw new Error("Failed to update theme");

          // Add success feedback if needed
          console.log("Theme updated successfully");
        } catch (err) {
          console.error("Theme update failed:", err);
          // You could add visual feedback for the error here
        }
      }
    });
  });
});
