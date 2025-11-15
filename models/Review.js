// models/Review.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },

    comment: {
        type: String,
        trim: true,
        maxlength: 1000,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Optional: Prevent users from reviewing the same course more than once
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
