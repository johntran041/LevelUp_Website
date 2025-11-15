const mongoose = require("mongoose");
const { Schema } = mongoose;

const institutionSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    dateJoined: {
        type: Date,
        default: Date.now,
    },

    // List of related course IDs
    courses: [
        {
            type: Schema.Types.ObjectId,
            ref: "Course",
        },
    ],

    // List of instructor users
    instructors: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    // List of student users
    students: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
});

module.exports = mongoose.model("Institution", institutionSchema);
