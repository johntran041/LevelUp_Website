document
    .getElementById("forgetForm")
    .addEventListener("submit", function (event) {
        const getVal = (id) => document.getElementById(id).value.trim();
        const setError = (id, msg) =>
            (document.getElementById("emailError").innerText = msg);
        setError("userEmail", "");

        let valid = true;

        const userEmail = getVal("userEmail");

        // Check if the email field is empty
        if (!userEmail) {
            valid = false;
            setError("userEmail", "Please enter your email address.");
        } else if (!/\S+@\S+\.\S+/.test(userEmail)) {
            // Check if the email format is valid
            valid = false;
            setError("userEmail", "Please enter a valid email.");
        }

        // If not valid, prevent form submission
        if (!valid) event.preventDefault();
    });
