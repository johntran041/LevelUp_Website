document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const passwordInput = document.querySelector('input[name="password"]');

    const errorContainer = document.createElement("div");
    errorContainer.classList.add("alert", "alert-danger", "mt-3");
    errorContainer.style.display = "none";
    form.insertBefore(errorContainer, form.lastElementChild);

    form.addEventListener("submit", (e) => {
        const password = passwordInput.value.trim();

        const hasMinLength = password.length >= 8;
        const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
        const hasLetterNumber =
            /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
        const hasSpecialChar = /[^A-Za-z0-9<>]/.test(password);
        const containsIllegalChar = /[<>]/.test(password);

        let passedCriteria = 0;
        if (hasMinLength) passedCriteria++;
        if (hasUpperLower) passedCriteria++;
        if (hasLetterNumber) passedCriteria++;
        if (hasSpecialChar) passedCriteria++;

        // Check if less than 2 criteria passed or contains < or >
        if (passedCriteria < 2 || containsIllegalChar) {
            e.preventDefault();

            const messages = [];
            if (!hasMinLength) messages.push("At least 8 characters");
            if (!hasUpperLower)
                messages.push("A mix of uppercase and lowercase letters");
            if (!hasLetterNumber) messages.push("A mix of letters and numbers");
            if (!hasSpecialChar)
                messages.push(
                    "At least one special character (e.g. ! @ # ? ])"
                );
            if (containsIllegalChar)
                messages.push("Password must not contain < or >");

            errorContainer.innerHTML = `
                <strong>Password must meet at least <u>2</u> of the following criteria:</strong>
                <ul class="mt-2 mb-0">
                    ${messages.map((msg) => `<li>${msg}</li>`).join("")}
                </ul>
            `;
            errorContainer.style.display = "block";
            passwordInput.classList.add("is-invalid");
        } else {
            errorContainer.style.display = "none";
            passwordInput.classList.remove("is-invalid");
        }
    });
});
