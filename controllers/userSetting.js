const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.renderUserPreference = async (req, res) => {
    try {
        const loggedInUserId = req.signedCookies?.userId;
        const routeUser = await User.findById(loggedInUserId);

        if (!routeUser) {
            return res.status(404).send("User not found");
        }

        const success = req.query.success;

        res.render("userSettingProfilePreference", {
            user: routeUser,
            activePage: "profileSetting",
            success,
        });
    } catch (error) {
        console.error("Error rendering user profile settings:", error);
        res.status(500).send("Failed to render user profile settings");
    }
};

exports.updateUserPreference = async (req, res) => {
    try {
        const { userId } = req.params;

        const { firstName, lastName, email, headline, description } = req.body;
        const updateData = {
            firstName,
            lastName,
            email,

            headline,
            description,
        };

        // Handle uploaded avatar
        if (req.file) {
            updateData.avatar = req.file.path;
        }

        await User.findByIdAndUpdate(userId, updateData);
        res.redirect(`/userSettings/profilePreference/${userId}?success=1`);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Failed to update user");
    }
};

exports.renderDisplay = async (req, res) => {
    try {
        const routeUserId = req.params.userId;
        const routeUser = await User.findById(routeUserId);
        if (!routeUser) {
            return res.status(404).send("User not found");
        }

        res.render("userSettingDisplay", {
            user: routeUser,
            activePage: "display",
        });
    } catch (error) {
        console.error("Error rendering user profile settings:", error);
        res.status(500).send("Failed to render user profile settings");
    }
};

exports.renderAccountSecurity = async (req, res) => {
    try {
        const routeUserId = req.params.userId;
        const routeUser = await User.findById(routeUserId);
        if (!routeUser) {
            return res.status(404).send("User not found");
        }

        res.render("userSettingSecurity", {
            user: routeUser,
            activePage: "security",
            success: req.query.success === "1" || req.query.success === "true",
            error: req.query.error || null,
        });
    } catch (error) {
        console.error("Error rendering user profile settings:", error);
        res.status(500).send("Failed to render user profile settings");
    }
};
exports.renderAccountBalance = async (req, res) => {
    try {
        const routeUserId = req.params.userId;
        const routeUser = await User.findById(routeUserId);
        if (!routeUser) {
            return res.status(404).send("User not found");
        }

        res.render("userSettingBalance", {
            user: routeUser,
            activePage: "balance",
            success: req.query.success,
        });
    } catch (error) {
        console.error("Error rendering user profile settings:", error);
        res.status(500).send("Failed to render user profile settings");
    }
};

exports.updateUserDisplay = async (req, res) => {
    try {
        const { userId } = req.params;
        const theme = req.body.theme || req.body?.theme;

        await User.findByIdAndUpdate(
            userId,
            { theme },
            { runValidators: true }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error updating user display settings:", error);
        res.status(500).json({ success: false });
    }
};

exports.updateUserSecurity = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send("User not found");
        }

        const { newEmail, oldPassword, newPassword, confirmPassword } =
            req.body;

        // Update email if changed
        if (newEmail && newEmail !== user.email) {
            user.email = newEmail;
        }

        // Handle password update
        if (oldPassword || newPassword || confirmPassword) {
            // All fields must be filled
            if (!oldPassword || !newPassword || !confirmPassword) {
                return res.redirect(
                    `/userSettings/security/${userId}?error=Please+fill+all+password+fields`
                );
            }

            // Check if old password matches the stored one
            const isPasswordMatch = await bcrypt.compare(
                oldPassword,
                user.password
            );
            if (!isPasswordMatch) {
                return res.redirect(
                    `/userSettings/security/${userId}?error=Old+password+is+incorrect`
                );
            }

            // Check if new passwords match
            if (newPassword !== confirmPassword) {
                return res.redirect(
                    `/userSettings/security/${userId}?error=Passwords+do+not+match`
                );
            }

            const isSameAsOld = await bcrypt.compare(
                newPassword,
                user.password
            );
            if (isSameAsOld) {
                return res.redirect(
                    `/userSettings/security/${userId}?error=New+password+must+be+different+from+old+password`
                );
            }

            // Hash new password and assign
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            user.password = hashedPassword;
        }

        await user.save({ validateModifiedOnly: true });

        res.redirect(`/userSettings/security/${userId}?success=1`);
    } catch (error) {
        console.error("Error updating user security settings:", error);
        res.status(500).send("Failed to update user security settings");
    }
};

exports.updateUserBalance = async (req, res) => {
    try {
        const { userId } = req.params;
        const { cardNumber, expirationDate, cvv, cardHolderName, coin } =
            req.body;

        const updatePayload = {};

        // Update card details
        if (cardNumber && expirationDate && cvv && cardHolderName) {
            const sanitizedCardNumber = cardNumber.replace(/\s/g, "");
            const last4 = sanitizedCardNumber.slice(-4);

            updatePayload.cardPaymentInfo = {
                cardNumber: `**** **** **** ${last4}`,
                expirationDate,
                cvv,
                cardHolderName,
            };
        }

        // Update coin balance if provided
        if (coin !== undefined) {
            updatePayload.coin = parseFloat(coin);
        }

        await User.findByIdAndUpdate(userId, updatePayload, {
            runValidators: true,
        });

        res.redirect(`/userSettings/balance/${userId}?success=1`);
    } catch (error) {
        console.error("Error updating user balance:", error);
        res.status(500).send("Failed to update user balance");
    }
};
