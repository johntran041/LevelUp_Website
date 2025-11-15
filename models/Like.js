const mongoose = require("mongoose");
const { Schema } = mongoose;

const likeSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    time: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Like", likeSchema);
