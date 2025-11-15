const express = require("express");
const router = express.Router();
const { storage } = require("../utils/cloudinary");
const multer = require("multer");
const upload = multer({ storage });
const { requireOwnUserAccess } = require("../middlewares/auth");

const {
    renderUserPreference,
    renderAccountSecurity,
    renderAccountBalance,
    renderDisplay,
    updateUserPreference,
    updateUserDisplay,
    updateUserSecurity,
    updateUserBalance,
} = require("../controllers/userSetting");

router.get(
    "/profilePreference/:userId",
    requireOwnUserAccess,
    renderUserPreference
);
router.post(
    "/profilePreference/update/:userId",
    upload.single("avatar"),
    updateUserPreference
);

router.get("/display/:userId", requireOwnUserAccess, renderDisplay);
router.post("/display/update/:userId", updateUserDisplay);

router.get("/security/:userId", requireOwnUserAccess, renderAccountSecurity);
router.post("/security/update/:userId", updateUserSecurity);

router.get("/balance/:userId", requireOwnUserAccess, renderAccountBalance);
router.post("/balance/update/:userId", updateUserBalance);

module.exports = router;
