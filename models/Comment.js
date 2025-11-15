const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    time: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Comment", commentSchema);
