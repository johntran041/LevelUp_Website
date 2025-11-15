const express = require("express");
const router = express.Router();
const { renderUserProfile } = require("../controllers/userProfile");
const { followUser, unfollowUser } = require("../controllers/follow");


router.get("/:userRouteId", renderUserProfile);
router.post("/follow/:userId", followUser);
router.post( "/unfollow/:userId", unfollowUser);

module.exports = router;