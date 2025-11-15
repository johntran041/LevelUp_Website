const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    attachment: {
        type: String, // URL or path to the file
        default: null,
    },
    deletedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
