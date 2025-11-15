// controllers/adminUser.js
const User = require("../../models/User");
const Course = require("../../models/Course");
const bcrypt = require("bcrypt");

exports.renderAdminUser = async (req, res) => {
    try {
        const users = await User.find();
        res.render("adminUser", { users, activePage: "users" });
    } catch (error) {
        console.error("Error fetching users:", error);
    }
};

exports.renderAdminUserAdd = (req, res) => {
    res.render("adminUserAdd", { activePage: "users" });
};

exports.renderAdminUserDetail = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).lean();
        if (!user) {
            return res.status(404).send("User not found");
        }

        const coursesInstructing = await Course.find({
            author: user._id,
        }).lean();
        const coursesStudying = await Course.find({
            studentsEnrolled: user._id,
        }).lean();

        res.render("adminUserDetail", {
            user,
            coursesInstructing,
            coursesStudying,
            activePage: "users",
        });
    } catch (error) {
        console.error("Error loading user detail:", error);
        res.status(500).send("Server Error");
    }
};

exports.addNewUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        if (!password) {
            throw new Error("Password is required");
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            avatar: req.file ? req.file.path : undefined,
        });

        await newUser.save();
        res.redirect("/admin/users");
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).send(err.message);
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            firstName,
            lastName,
            email,
            role,
            headline,
            description,
            status,
        } = req.body;

        const updateData = {
            firstName,
            lastName,
            email,
            role,
            headline,
            description,
            status,
        };

        if (req.file && req.file.path) {
            updateData.avatar = req.file.path; // Cloudinary returns full URL
        }

        await User.findByIdAndUpdate(userId, updateData);
        res.redirect("/admin/users");
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Failed to update user");
    }
};

exports.achiveUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Set the user's status to "inactive"
        await User.findByIdAndUpdate(userId, { status: "inactive" });
        res.redirect("/admin/users");
    } catch (error) {
        console.error("Error archiving user:", error);
        res.status(500).send("Failed to archive user");
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        await User.findByIdAndDelete(userId);

        res.redirect("/admin/users");
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Failed to delete user");
    }
};
