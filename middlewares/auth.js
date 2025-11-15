const User = require("../models/User");
exports.preventAuthAccess = (req, res, next) => {
    const userId = req.signedCookies.userId;
    const userRole = req.signedCookies.userRole;

    if (userId) {
        const path = req.originalUrl;

        if (userRole === "Admin" && !path.startsWith("/admin")) {
            return res.redirect("/admin/users");
        }
        if (userRole !== "Admin" && path !== "/") {
            return res.redirect("/");
        }
    }

    return next();
};

exports.requireOwnUserAccess = (req, res, next) => {
    const loggedInUserId = req.signedCookies.userId;
    const routeUserId = req.params.userId;

    if (!loggedInUserId || loggedInUserId !== routeUserId) {
        return res.status(403).send("Unauthorized access.");
    }

    next();
};

exports.requireOwnUserAccess = (req, res, next) => {
    const loggedInUserId = req.signedCookies.userId;
    const routeUserId = req.params.userId;
    console.log("🔍 loggedInUserId from cookie:", loggedInUserId);
    console.log("🔍 routeUserId from URL:", routeUserId);

    if (!loggedInUserId || loggedInUserId !== routeUserId) {
        return res.status(403).send("Unauthorized access.");
    }

    next();
};

exports.requireLogin = async (req, res, next) => {
    const userId = req.signedCookies.userId;

    if (!userId) {
        return res.redirect("/auth/login");
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            res.clearCookie("userId");
            return res.redirect("/auth/login");
        }

        req.user = user; // <-- Assign the logged-in user for use in routes
        next();
    } catch (err) {
        console.error("requireLogin error:", err);
        res.redirect("/auth/login");
    }
};
