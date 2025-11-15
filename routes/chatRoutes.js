const express = require("express");
const router = express.Router();
const upload = require("../middlewares/MessageUpload");
const Message = require("../models/Message");
const User = require("../models/User");
const { requireLogin, requireOwnUserAccess } = require("../middlewares/auth");  
const {
    renderChatPage,
    getMessages,
    sendMessage,
    deleteChat,
} = require("../controllers/MessageControllers");

// Protect the /messages route with requireLogin
router.get("/messages",requireLogin,renderChatPage);
router.get("/message/:userId",requireLogin, requireOwnUserAccess, getMessages);
router.post("/message",requireLogin, sendMessage);
router.delete("/chat/:contactId",requireLogin,deleteChat);

module.exports = router;
