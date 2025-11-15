// Updated footer.js with subscription functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get the subscription form in the footer
  const subscriptionForm = document.querySelector("footer form");

  if (subscriptionForm) {
    subscriptionForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Get the email input
      const emailInput = subscriptionForm.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      // Basic email validation
      if (!isValidEmail(email)) {
        showSubscriptionMessage("Please enter a valid email address.", "error");
        return;
      }

      // Send the subscription request to the server
      sendSubscriptionRequest(email, emailInput);
    });
  }

  function isValidEmail(email) {
    // Basic email validation regex
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function showSubscriptionMessage(message, type) {
    // Remove any existing status messages
    const existingStatus = document.getElementById("subscriptionStatus");
    if (existingStatus) {
      existingStatus.remove();
    }

    // Create a new status element
    const statusElement = document.createElement("div");
    statusElement.id = "subscriptionStatus";
    statusElement.textContent = message;

    // Style based on type
    if (type === "error") {
      statusElement.style.color = "#fff";
      statusElement.style.backgroundColor = "rgba(220, 53, 69, 0.8)";
    } else if (type === "success") {
      statusElement.style.color = "#fff";
      statusElement.style.backgroundColor = "rgba(40, 167, 69, 0.8)";
    } else {
      statusElement.style.color = "#fff";
    }

    // Add common styles
    statusElement.style.padding = "8px 12px";
    statusElement.style.borderRadius = "4px";
    statusElement.style.marginTop = "10px";
    statusElement.style.fontSize = "14px";

    // Add the status element after the form
    subscriptionForm.after(statusElement);

    // Clear the message after 5 seconds
    setTimeout(() => {
      statusElement.remove();
    }, 5000);
  }

  function sendSubscriptionRequest(email, emailInput) {
    // Show processing message
    showSubscriptionMessage("Processing your subscription...", "info");

    // Disable the submit button
    const submitButton = subscriptionForm.querySelector(
      'button[type="submit"]'
    );
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.originalText = submitButton.textContent;
      submitButton.textContent = "Processing...";
    }

    // Send the subscription request to the server
    fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showSubscriptionMessage(
            "Thank you for subscribing! Please check your email for confirmation.",
            "success"
          );
          emailInput.value = ""; // Clear the input
        } else {
          showSubscriptionMessage(
            data.message || "Something went wrong. Please try again.",
            "error"
          );
        }
      })
      .catch((error) => {
        console.error("Subscription error:", error);
        showSubscriptionMessage(
          "Could not connect to the server. Please try again later.",
          "error"
        );
      })
      .finally(() => {
        // Re-enable the submit button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitButton.originalText || "Subscribe";
        }
      });
  }
});
