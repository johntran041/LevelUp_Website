// Updated contactForm.js that works with both the contact page and footer modal
document.addEventListener("DOMContentLoaded", function () {
  // Get both contact forms (standalone page and modal)
  const contactForms = document.querySelectorAll("#contactForm");

  // Process each form found
  contactForms.forEach((contactForm) => {
    const formParent =
      contactForm.closest(".modal-content") ||
      contactForm.closest(".contact-form-container");

    // Find the status element that's relevant to this form
    const contactStatus = formParent.querySelector("#contactStatus");

    // Find button elements for this specific form
    const submitButton = contactForm.querySelector(".contact-submit-btn");
    const submitSpinner = submitButton
      ? submitButton.querySelector(".spinner-border")
      : null;
    const submitText = submitButton
      ? submitButton.querySelector(".btn-text")
      : null;

    // Form validation and submission
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        event.stopPropagation();
        contactForm.classList.add("was-validated");
        return;
      }

      // Collect form data
      const formData = {
        name: contactForm.querySelector("#name").value.trim(),
        email: contactForm.querySelector("#email").value.trim(),
        subject: contactForm.querySelector("#subject").value,
        message: contactForm.querySelector("#message").value.trim(),
      };

      // Send the form data
      sendContactForm(
        formData,
        contactForm,
        submitButton,
        submitSpinner,
        submitText,
        contactStatus
      );
    });
  });

  // Function to send the form data
  function sendContactForm(
    formData,
    form,
    submitButton,
    submitSpinner,
    submitText,
    contactStatus
  ) {
    // Show loading state
    if (submitButton && submitSpinner && submitText) {
      submitButton.disabled = true;
      submitSpinner.classList.remove("d-none");
      submitText.textContent = "Sending...";
    }

    // Clear any previous status
    if (contactStatus) {
      contactStatus.textContent = "";
      contactStatus.className = "text-center mt-4";
      contactStatus.style.display = "none";
    }

    console.log("Sending form data:", formData);

    // Send the form data to the server
    fetch("/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        console.log("Server response status:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("Server response data:", data);
        if (data.success) {
          showContactStatus(
            contactStatus,
            data.message ||
              "Thank you! Your message has been sent successfully. We will get back to you soon.",
            "success"
          );
          form.reset();
          form.classList.remove("was-validated");

          // If it's the modal form, close it after 2 seconds
          if (form.closest(".modal")) {
            setTimeout(() => {
              const modalInstance = bootstrap.Modal.getInstance(
                form.closest(".modal")
              );
              if (modalInstance) {
                modalInstance.hide();
              }
            }, 2000);
          }
        } else {
          showContactStatus(
            contactStatus,
            data.message || "Something went wrong. Please try again.",
            "error"
          );
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        showContactStatus(
          contactStatus,
          "Could not connect to the server. Please try again later.",
          "error"
        );
      })
      .finally(() => {
        // Reset button state
        if (submitButton && submitSpinner && submitText) {
          submitButton.disabled = false;
          submitSpinner.classList.add("d-none");
          submitText.textContent = "Send Message";
        }
      });
  }

  // Function to show contact status
  function showContactStatus(statusElement, message, type) {
    if (!statusElement) return;

    statusElement.textContent = message;
    statusElement.className = "text-center mt-4";
    statusElement.classList.add(type);
    statusElement.style.display = "block";

    // Style based on status type
    if (type === "success") {
      statusElement.style.color = "#155724";
      statusElement.style.backgroundColor = "#d4edda";
      statusElement.style.border = "1px solid #c3e6cb";
    } else if (type === "error") {
      statusElement.style.color = "#721c24";
      statusElement.style.backgroundColor = "#f8d7da";
      statusElement.style.border = "1px solid #f5c6cb";
    }

    statusElement.style.padding = "15px";
    statusElement.style.borderRadius = "8px";
    statusElement.style.marginTop = "20px";

    // Scroll to status message if not in a modal
    if (!statusElement.closest(".modal")) {
      statusElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
});
