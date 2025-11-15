const User   = require("../models/User");
const Course = require("../models/Course");

exports.renderUserProfile = async (req, res) => {
  try {
    const { userRouteId } = req.params;
    const profileUser = await User.findById(userRouteId).lean();
    if (!profileUser) return res.status(404).send("User not found.");

    const loggedInUserId = req.signedCookies?.userId;
    const loggedInUser   = loggedInUserId
      ? await User.findById(loggedInUserId).lean()
      : null;
    const isOwner = loggedInUserId === profileUser._id.toString();

    // determine if the logged-in user is already following this profile
    let isFollowing = false;
    if (loggedInUser && Array.isArray(loggedInUser.following)) {
      isFollowing = loggedInUser.following
        .map(id => id.toString())
        .includes(profileUser._id.toString());
    }

    // load their studied / enrolled courses...
    let studiedCourses = [];
    if (Array.isArray(profileUser.purchasedCourses) && profileUser.purchasedCourses.length) {
      studiedCourses = await Course.find({
        _id: { $in: profileUser.purchasedCourses }
      })
        .populate("author", "firstName lastName")
        .lean();
    } else {
      studiedCourses = await Course.find({
        studentsEnrolled: profileUser._id
      })
        .populate("author", "firstName lastName")
        .lean();
    }

    // load the ones they created
    const createdCourses = await Course.find({ author: profileUser._id })
      .populate("author", "firstName lastName")
      .lean();

    // finally, render and include `isFollowing`
    res.render("userProfile", {
      user:           loggedInUser,
      profileUser,
      isOwner,
      isFollowing,
      studiedCourses,
      createdCourses,
    });

  } catch (err) {
    console.error("Error loading user profile:", err);
    res.status(500).send("Server error.");
  }
};
