const express = require("express");
const router = express.Router();
const {
    renderRegisterPage,
    renderLoginPage,
    renderForgetPasswordPage,
    renderResetPasswordPage,
    loginUser,
    registerUser,
    forgetPasswordUser,
    resetPasswordUser,
    logout,
} = require("../controllers/authentication");

const { preventAuthAccess } = require("../middlewares/auth");

// Render registration page
router.get("/register", preventAuthAccess, renderRegisterPage);

// Handle registration
router.post("/register", registerUser);

// Render Login page
router.get("/login", preventAuthAccess, renderLoginPage);

// Handle login
router.post("/login", loginUser);

// Render forget password page
router.get("/forgetPassword", preventAuthAccess, renderForgetPasswordPage);

// Handle forget password
router.post("/forgetPassword", forgetPasswordUser);

// Render reset password page
router.get(
    "/forgetPassword/resetPassword",
    preventAuthAccess,
    renderResetPasswordPage
);

// Handle reset password
router.post("/forgetPassword/resetPassword", resetPasswordUser);

router.get("/logout", logout);

module.exports = router;
