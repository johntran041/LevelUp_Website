const Course = require("../../models/Course");
const User = require("../../models/User");

exports.renderCourse = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate("author", "firstName lastName") // Only get author name
            .populate("studentsEnrolled", "_id") // For length/count only
            .lean();

        res.render("adminCourse", {
            courses,
            activePage: "courses",
        });
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).send("Failed to load courses.");
    }
};

exports.renderCourseAdd = async (req, res) => {
    try {
        const instructors = await User.find({ role: "Instructor" });
        const students = await User.find({ role: "Student" });
        res.render("adminCourseAdd", {
            students,
            instructors,
            activePage: "courses",
        });
    } catch (error) {
        console.error("Error fetching instructors/students:", error);
        res.status(500).send("Failed to fetch instructors/students.");
    }
};

exports.addNewCourse = async (req, res) => {
    try {
        const { name, author, studentsEnrolled, price } = req.body;

        // Convert comma-separated student IDs into an array of ObjectIds
        const studentIds = studentsEnrolled
            ? studentsEnrolled.split(",").map((id) => id.trim())
            : [];

        // Validate required fields
        if (!name || !author || !price) {
            return res.status(400).send("Missing required fields.");
        }

        // Create a new Course instance
        const newCourse = new Course({
            name,
            author, // Instructor ID (as ObjectId string)
            studentsEnrolled: studentIds, // Array of student ObjectId strings
            price,
            // dateCreated and status are handled by default in the schema
        });

        // Save to database
        await newCourse.save();

        res.redirect("/admin/courses");
    } catch (err) {
        console.error("Error creating course:", err);
        res.status(500).send("Failed to add course.");
    }
};

exports.updateCourseDetail = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { name, author, studentsEnrolled, price, status } = req.body;

        const studentIds = studentsEnrolled
            ? studentsEnrolled.split(",").map((id) => id.trim())
            : [];

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).send("Course not found");

        course.name = name;
        course.author = author;
        course.studentsEnrolled = studentIds;
        course.price = parseFloat(price);
        course.status = status;

        await course.save();
        res.redirect("/admin/courses");
    } catch (err) {
        console.error("Error updating course:", err);
        res.status(500).send("Failed to update course.");
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        await Course.findByIdAndDelete(courseId);
        res.redirect("/admin/courses");
    } catch (err) {
        console.error("Error deleting course:", err);
        res.status(500).send("Failed to delete course.");
    }
};

exports.renderCourseDetail = async (req, res) => {
    try {
        const { courseId } = req.params;

        const instructors = await User.find({ role: "Instructor" });
        const students = await User.find({ role: "Student" });

        // Populate author and studentsEnrolled fields
        const course = await Course.findById(courseId)
            .populate("author", "firstName lastName email")
            .populate("studentsEnrolled", "firstName lastName email")
            .lean();

        if (!course) {
            return res.status(404).send("Course not found");
        }

        res.render("adminCourseDetail", {
            instructors,
            students,
            course,
            activePage: "courses",
        });
    } catch (error) {
        console.error("Error fetching course detail:", error);
        res.status(500).send("Server Error");
    }
};
