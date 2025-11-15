const mongoose = require("mongoose");
const { Schema } = mongoose;
const sectionSchema = require("./Section");
const lessonSchema = require("./Lesson");

const courseSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    studentsEnrolled: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    price: {
        type: Number,
        required: true,
        min: 0,
    },

    dateCreated: {
        type: Date,
        default: Date.now,
    },

    status: {
        type: String,
        enum: ["Not Started", "On Going", "Finished"],
        default: "Not Started",
    },

    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },

    image: {
        type: String,
        default: "images/defaultCourse.png",
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    category: {
        type: String,
        enum: [
            "Web Development",
            "Mobile Development",
            "Data Science",
            "Machine Learning",
            "Cloud Computing",
            "Cyber Security",
            "Game Development",
            "AI & Deep Learning",
            "Blockchain",
            "DevOps",
            "Software Engineering",
            "Digital Marketing",
            "UI/UX Design",
            "Project Management",
            "Business Analysis",
            "Networking",
            "Database Management",
            "IT Support",
            "Quality Assurance",
            "Data Analysis",
            "Data Engineering",
            "Others",
        ],
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },

    // Course Content
    sections: [
        {
            type: Schema.Types.ObjectId,
            ref: "Section", // match your model export name
        },
    ],

    duration: {
        type: String,
        required: true,
    },

    learningOutcomes: [{ type: String }], // What you will learn
});

module.exports = mongoose.model("Course", courseSchema);
