const session = require("express-session");
const User = require("../models/User");

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
});

const setUserFromCookie = async (req, res, next) => {
    const userId = req.signedCookies?.userId;
    if (userId) {
        try {
            const user = await User.findById(userId).lean();
            res.locals.user = user;
        } catch (err) {
            console.error("❌ Failed to fetch user from cookie:", err);
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
};

function requireOwnUserAccess(req, res, next) {
    const loggedInUserId = req.signedCookies.userId;
    const routeUserId = req.params.userId;

    if (!loggedInUserId || loggedInUserId !== routeUserId) {
        return res.status(403).send("error in setUser");
    }
    next();
}

module.exports = {
    sessionMiddleware,
    setUserFromCookie,
    requireOwnUserAccess,
};
