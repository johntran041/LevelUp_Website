const mongoose = require("mongoose");
const { Schema } = mongoose;

const sectionSchema = new Schema({
    title: { type: String, required: true },
    lessons: [
        {
            type: Schema.Types.ObjectId,
            ref: "Lesson",
        },
    ],
});

module.exports = mongoose.model("Section", sectionSchema);
