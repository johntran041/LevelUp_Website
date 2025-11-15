const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author is required"],
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        media: [
            {
                type: String, // URL of image/video
                default: null,
            },
        ],
        likes: {
            type: Number,
            default: 0,
        },
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["active", "archived"],
            default: "active",
        },
        feelings: {
            type: String,
        },
        privacy: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

module.exports = mongoose.model("Post", postSchema);
