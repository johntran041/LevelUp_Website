const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Course = require("../models/Course");
const { preventAuthAccess } = require("../middlewares/auth");

// Keep the sample courses simple with just the fields needed for display
const sampleCourses = [
    {
        _id: "sample-course-1", // Add this line
        title: "Fullstack Web Development",
        description:
            "Learn to build complete web apps using MERN stack with real-world projects.",
        instructor: "Alex Pham",
        imageUrl: "/images/defaultCourse.png",
        category: "Web Development",
        duration: "12h 30m",
        rating: 4.8,
        createdAt: new Date("2025-04-25"),
        price: 49.99, // Add basic price for display
    },
    {
        _id: "sample-course-2",
        title: "Introduction to Data Science",
        description:
            "Master the basics of Python, pandas, and data visualization techniques.",
        instructor: "Dr. Jane Tran",
        imageUrl: "/images/defaultCourse.png",
        category: "Data Science",
        duration: "10h 45m",
        rating: 4.5,
        createdAt: new Date("2025-04-20"),
        price: 59.99,
    },
    // Other sample courses with the same simplified format...
    {
        _id: "sample-course-3",
        title: "Creative UI/UX Design",
        description: "Design interfaces users love using Figma and Adobe XD.",
        instructor: "Minh Chau",
        imageUrl: "/images/defaultCourse.png",
        category: "UI/UX Design",
        duration: "8h",
        rating: 4.6,
        createdAt: new Date("2025-04-18"),
        price: 39.99,
    },
    {
        _id: "sample-course-4",
        title: "Digital Marketing 101",
        description: "Explore SEO, SEM, and social media marketing strategies.",
        instructor: "Linh Vu",
        imageUrl: "/images/defaultCourse.png",
        category: "Digital Marketing",
        duration: "6h 30m",
        rating: 4.3,
        createdAt: new Date("2025-03-30"),
        price: 29.99,
    },
    {
        _id: "sample-course-5",
        title: "Cyber Security Basics",
        description:
            "Understand threats, firewalls, encryption, and how to protect your systems.",
        instructor: "Anh Tuan",
        imageUrl: "/images/defaultCourse.png",
        category: "Cyber Security",
        duration: "7h",
        rating: 4.7,
        createdAt: new Date("2025-04-10"),
        price: 49.99,
    },
    {
        _id: "sample-course-6",
        title: "Project Management Fundamentals",
        description:
            "Learn how to initiate, plan, execute, and close projects successfully.",
        instructor: "Nguyen Huy",
        imageUrl: "/images/defaultCourse.png",
        category: "Project Management",
        duration: "5h 45m",
        rating: 4.2,
        createdAt: new Date("2025-04-05"),
        price: 34.99,
    },
];

router.get("/", preventAuthAccess, async (req, res) => {
    try {
        const userId = req.signedCookies.userId;
        const user = await User.findById(userId).lean();

        // Try to fetch real courses from database first
        const dbCourses = await Course.find()
            .sort({ dateCreated: -1 })
            .limit(6)
            .select(
                "name description author image category duration rating price"
            ) // Only select fields needed for display
            .populate("author", "firstName lastName") // Get author name
            .lean();

        let newCourses, popularCourses;

        // If database has courses, use them; otherwise use sample courses
        if (dbCourses && dbCourses.length > 0) {
            // For displaying on homepage, transform DB courses to match sample course format
            const formattedDbCourses = dbCourses.map((course) => ({
                _id: course._id,
                title: course.name,
                description: course.description,
                instructor: course.author
                    ? `${course.author.firstName} ${course.author.lastName}`
                    : "Unknown Instructor",
                imageUrl: course.image,
                category: course.category,
                duration: course.duration,
                rating: course.rating,
                price: course.price,
            }));

            newCourses = formattedDbCourses.slice(0, 3);
            popularCourses =
                formattedDbCourses.length > 3
                    ? formattedDbCourses.slice(3, 6)
                    : [...formattedDbCourses];
        } else {
            // Use sample courses as fallback
            newCourses = sampleCourses.slice(0, 3);
            popularCourses =
                sampleCourses.length > 3
                    ? sampleCourses.slice(3, 6)
                    : [...sampleCourses];
        }

        res.render("homepage", {
            user,
            newCourses,
            popularCourses,
        });
    } catch (err) {
        console.error("Error loading homepage courses:", err);
        res.render("homepage", {
            user,
            newCourses: sampleCourses.slice(0, 3),
            popularCourses: sampleCourses.slice(3, 6),
        });
    }
});

// Export the router and sample courses
module.exports = router;
module.exports.sampleCourses = sampleCourses;
