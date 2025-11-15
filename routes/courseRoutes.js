const express = require("express");
const router = express.Router();
const fs = require("fs");
const Course = require("../models/Course");
const User = require("../models/User");
const Section = require("../models/Section");
const Lesson = require("../models/Lesson");
const { categories } = require("../constants/categories");
const Cart = require("../models/Cart");
const { preventAuthAccess } = require("../middlewares/auth");

const multer = require("multer");
const { courseStorage } = require("../utils/cloudinary");
const upload = multer({
    storage: courseStorage,
    limits: { fileSize: 99 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only images are allowed!"), false);
        }
        cb(null, true);
    },
});

// Get all courses with optional category filter
router.get("/", async (req, res) => {
    try {
        const selectedCategory = req.query.category;
        const loggedInUserId = req.signedCookies?.userId;
        const loggedInUser = await User.findById(loggedInUserId).lean();
        if (loggedInUser?.purchasedCourses) {
            loggedInUser.purchasedCourses = loggedInUser.purchasedCourses.map(
                (id) => id.toString()
            );
        }

        let filter = {};

        if (selectedCategory) {
            filter.category = selectedCategory;
        }

        const courses = await Course.find(filter)
            .populate("author", "firstName lastName _id")
            .lean();

        res.render("allCourses", {
            courses,
            categories,
            selectedCategory,
            user: loggedInUser,
        });
    } catch (err) {
        console.error("Error loading courses:", err);
        res.status(500).send("Failed to load courses");
    }
});

// Display course creation form
router.get("/create", async (req, res) => {
    try {
        // Fetch instructors (users with instructor role)
        const instructors = await User.find({ role: "instructor" });
        const loggedInUserId = req.signedCookies?.userId;
        const loggedInUser = await User.findById(loggedInUserId);

        res.render("createCourse", {
            categories,
            instructors,
            loggedInUser,
            formData: {},
        });
    } catch (err) {
        console.error("Error loading create course form:", err);
        res.status(500).send("Failed to load create course form");
    }
});

router.post("/create", upload.single("courseImage"), async (req, res) => {
    const instructors = await User.find({ role: "instructor" });
    const loggedInUserId = req.signedCookies?.userId;
    const loggedInUser = await User.findById(loggedInUserId);
    const formData = req.body;

    try {
        const {
            title,
            description,
            category,
            price,
            learningOutcomes,
            sections = {},
        } = formData;

        if (!req.file) throw new Error("Please upload a course image");

        // Parse learning outcomes
        const parsedOutcomes =
            typeof learningOutcomes === "string"
                ? learningOutcomes
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                : [];

        let totalSeconds = 0;
        const sectionIds = [];

        for (const [secIndex, sectionData] of Object.entries(sections)) {
            const sectionTitle = sectionData.title?.trim();
            if (!sectionTitle)
                throw new Error(`Section ${secIndex} is missing a title.`);

            const lessonsInput = sectionData.lessons || {};
            const lessonIds = [];

            for (const [lesIndex, lessonData] of Object.entries(lessonsInput)) {
                const { title: lessonTitle, duration, type } = lessonData;

                if (!lessonTitle || !duration || !type) {
                    throw new Error(
                        `Lesson ${lesIndex} in section ${secIndex} is incomplete.`
                    );
                }

                // Calculate time in seconds
                const parts = duration.split(":").map(Number).reverse();
                const seconds =
                    (parts[0] || 0) +
                    (parts[1] || 0) * 60 +
                    (parts[2] || 0) * 3600;
                totalSeconds += seconds;

                const lesson = new Lesson({
                    title: lessonTitle.trim(),
                    duration,
                    type,
                    content: "", // optional field
                });

                await lesson.save();
                lessonIds.push(lesson._id);
            }

            const section = new Section({
                title: sectionTitle,
                lessons: lessonIds,
            });

            await section.save();
            sectionIds.push(section._id);
        }

        // Convert totalSeconds to "Hh Mm" format
        const totalHours = Math.floor(totalSeconds / 3600);
        const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
        const durationFormatted = `${
            totalHours > 0 ? totalHours + "h " : ""
        }${totalMinutes}m`;

        const newCourse = new Course({
            name: title.trim(),
            description: description.trim(),
            author: loggedInUser._id,
            category,
            price,
            image: req.file.path,
            learningOutcomes: parsedOutcomes,
            duration: durationFormatted.trim(),
            sections: sectionIds,
        });

        await newCourse.save();
        res.redirect("/user/my-teaching");
    } catch (err) {
        console.error("❌ Course creation failed:", err);

        // Optional Cloudinary cleanup
        if (req.file?.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (deleteErr) {
                console.error(
                    "⚠️ Failed to delete Cloudinary image:",
                    deleteErr.message
                );
            }
        }

        res.status(500).render("createCourse", {
            categories,
            instructors,
            loggedInUser,
            error: "Failed to create course: " + err.message,
            formData: req.body,
        });
    }
});

// Modify the course detail route
router.get("/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate("author", "firstName lastName avatar")
            .populate("studentsEnrolled", "_id") // load that field
            .lean();
        if (!course) return res.status(404).send("Course not found");

        const userId = req.signedCookies?.userId;
        const enrolledIds = (course.studentsEnrolled || []).map((u) =>
            u._id.toString()
        );
        const isEnrolled = userId && enrolledIds.includes(userId);

        // const user = userId ? await User.findById(userId).lean() : null;

        res.render("courseDetail", {
            course,
            isEnrolled,
            // user,
        });
    } catch (err) {
        console.error("Error loading course:", err);
        res.status(500).send("Failed to load course");
    }
});

module.exports = router;
