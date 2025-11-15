const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const User = require("../models/User");

// My Courses page route - NO AUTHENTICATION CHECK FOR DEVELOPMENT
router.get("/my-courses", async (req, res) => {
    try {
     
        const loggedInUserId = req.signedCookies?.userId;
        const loggedInUser = await User.findById(loggedInUserId);

        const enrolledCourses = await Course.find({
            studentsEnrolled: { $in: [loggedInUserId] }
        })
        .populate("author", "firstName lastName email avatar")
        .lean();


        res.render("myCourses", { enrolledCourses, loggedInUser });
    } catch (err) {
        console.error("Error loading enrolled courses:", err);
        res.status(500).send("Failed to load your enrolled courses");
    }
});

router.get("/my-teaching", async (req, res) => {
    try {
        const loggedInUserRole = req.signedCookies?.userRole;
        const loggedInUserId = req.signedCookies?.userId;

        if (loggedInUserRole !== "Instructor") {
            return res
                .status(403)
                .send("Access denied. Only instructors can view this page.");
        }

        const loggedInUser = await User.findById(loggedInUserId);

        // ✅ Get all courses where the logged-in instructor is the author
        const courses = await Course.find({ author: loggedInUserId });

        res.render("myTeaching", {
            enrolledCourses: courses,
            loggedInUser,
        });
    } catch (err) {
        console.error("Error loading your teaching courses:", err);
        res.status(500).send("Failed to load your teaching courses");
    }
});

module.exports = router;
