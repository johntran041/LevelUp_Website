const mongoose = require("mongoose");
const { Schema } = mongoose;

const lessonSchema = new Schema({
    title: { type: String, required: true },
    duration: { type: String, required: true }, // e.g. "22:45"
    content: { type: String }, // Video URL or notes
});

module.exports = mongoose.model("Lesson", lessonSchema);
