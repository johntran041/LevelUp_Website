const bcrypt = require("bcrypt");
const User = require("../models/User");
const axios = require("axios");

//render register page
exports.renderRegisterPage = async (req, res) => {
    try {
        res.render("register");
    } catch (error) {
        console.log("Error rendering register page:", error);
        res.status(500).render("register", {
            error: "An error occurred while loading the registration page.",
        });
    }
};

//render Login page
exports.renderLoginPage = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.log("Error rendering register page:", error);
    }
};

//render forget password page
exports.renderForgetPasswordPage = async (req, res) => {
    try {
        res.render("forgetPassword");
    } catch (error) {
        console.log("Error rendering register page:", error);
    }
};

//render reset password page
exports.renderResetPasswordPage = async (req, res) => {
    try {
        res.render("resetPassword", {
            userEmail: req.session.userEmail,
        });
    } catch (error) {
        console.log("Error rendering register page:", error);
    }
};

//User register function
exports.registerUser = async (req, res) => {
    try {
        const {
            userFirstName,
            userLastName,
            userEmail,
            userPassword,
            userRole,
            "g-recaptcha-response": recaptchaToken,
        } = req.body;

        //Check CAPTCHA
        if (!recaptchaToken) {
            return res.render("register", {
                error: "Please complete the CAPTCHA.",
                formData: req.body,
            });
        }

        //Verify CAPTCHA with Google
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const verifyResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            new URLSearchParams({
                secret: secretKey,
                response: recaptchaToken,
            })
        );

        if (!verifyResponse.data.success) {
            return res.render("register", {
                error: "CAPTCHA verification failed. Try again.",
                formData: req.body,
            });
        }

        //Check if email already exists
        const existingUser = await User.findOne({ email: userEmail });
        if (existingUser) {
            return res.render("register", {
                error: "Email already registered.",
                formData: req.body,
            });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(userPassword, 12);

        //Create and save user
        const newUser = new User({
            firstName: userFirstName,
            lastName: userLastName,
            email: userEmail,
            password: hashedPassword,
            role: userRole,
        });

        await newUser.save();
        res.redirect("/auth/login");
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).render("register", {
            error: err.message || "An error occurred during registration.",
            formData: req.body,
        });
    }
};

// User Log In function
exports.loginUser = async (req, res) => {
    const {
        userEmail,
        userPassword,
        "g-recaptcha-response": recaptchaToken,
    } = req.body;

    if (!recaptchaToken) {
        return res.render("login", {
            error: "Please complete the CAPTCHA.",
            formData: req.body,
        });
    }

    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const captchaRes = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            new URLSearchParams({ secret: secretKey, response: recaptchaToken })
        );

        if (!captchaRes.data.success) {
            return res.render("login", {
                error: "CAPTCHA verification failed. Try again.",
                formData: req.body,
            });
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) return res.render("login", { error: "User not found." });

        const isMatch = await bcrypt.compare(userPassword, user.password);
        if (!isMatch)
            return res.render("login", { error: "Invalid password." });

        if (user.status === "inactive") {
            return res.render("login", {
                error: "Your account is inactive. Please contact support.",
            });
        }

        res.cookie("userId", user._id.toString(), {
            httpOnly: true,

            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            signed: true,
        });

        res.cookie("userRole", user.role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            signed: true,
        });
        // Redirect based on role
        if (user.role === "Admin") {
            return res.redirect("/admin/users");
        } else {
            return res.redirect(`/`);
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).render("login", {
            error: "An error occurred during login.",
        });
    }
};

//User forget their password function
exports.forgetPasswordUser = async (req, res) => {
    const { userEmail } = req.body;

    try {
        //Find user email
        const user = await User.findOne({ userEmail });

        if (!user) {
            // If the email is not found, send an error
            return res.render("forgetPassword", { error: "Email not found." });
        }

        // Redirect to reset password page with the email
        req.session.userEmail = userEmail;
        console.log("this is a session:", req.session.userEmail);

        res.redirect("/auth/forgetPassword/resetPassword");
    } catch (err) {
        console.error("Error during password reset:", err);
        res.status(500).render("forgetPassword", {
            error: "An error occurred while processing your forget Password request.",
        });
    }
};

//User reset password
exports.resetPasswordUser = async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const userEmail = req.session.userEmail;

    //Find user email
    try {
        const user = await User.findOne({ userEmail });
        //Check if user exist
        if (!user) {
            return res.render("resetPassword", {
                error: "User not found.",
                userEmail,
            });
        }

        //Check if the password match
        if (newPassword !== confirmPassword) {
            return res.render("resetPassword", {
                error: "Passwords do not match.",
                userEmail,
            });
        }

        //Check if the current password is the same as the previous password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.render("resetPassword", {
                error: "New password cannot be the same as the current password.",
                userEmail,
            });
        }

        // Check against password history
        if (user.passwordHistory) {
            for (let oldHashed of user.passwordHistory) {
                if (await bcrypt.compare(newPassword, oldHashed)) {
                    return res.render("resetPassword", {
                        error: "This password has been used before. Please choose a different password.",
                        userEmail,
                    });
                }
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Store current password before updating
        if (!user.passwordHistory) user.passwordHistory = [];
        user.passwordHistory.push(user.userPassword);

        // Trim to last 5 passwords
        if (user.passwordHistory.length > 5) {
            user.passwordHistory = user.passwordHistory.slice(-5);
        }

        // Save new password
        user.userPassword = hashedPassword;

        await user.save();
        req.session.userEmail = null;

        res.redirect("/auth/login");
    } catch (err) {
        console.error("Error during password reset:", err);
        res.status(500).render("resetPassword", {
            error: "An error occurred while processing your reset password request.",
            userEmail,
        });
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie("userId");
        res.clearCookie("userRole");
        req.session.destroy(() => {
            res.redirect("/");
        });
    } catch (err) {
        console.error("Logout Error:", err);
        res.status(500).render("login", {
            error: "An error occurred during logout.",
        });
    }
};
