const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },

    lastName: {
        type: String,
        required: true,
        trim: true,
    },

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

    role: {
        type: String,
        enum: ["Student", "Instructor", "Admin"],
        required: true,
        default: "Student",
    },

    headline: {
        type: String,
        trim: true,
    },

    description: {
        type: String,
        trim: true,
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },

    avatar: {
        type: String, // URL to avatar image (e.g., Cloudinary or local path)
        default:
            "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3467.jpg",
    },

    dateJoined: {
        type: Date,
        default: Date.now,
        validate: {
            validator: function (password) {
                // Must be at least 8 characters and match at least two criteria
                const criteria = [
                    /.{8,}/.test(password), // Min 8 chars
                    /[a-z]/.test(password) && /[A-Z]/.test(password), // Upper and lower
                    /[a-zA-Z]/.test(password) && /\d/.test(password), // Letters and numbers
                    /[!@#?\]]/.test(password), // Special character
                ];
                // At least 2 of the 4 criteria must be true
                return criteria.filter(Boolean).length >= 2;
            },
            message:
                "Password must meet at least 2 of the following: minimum 8 characters, a mix of uppercase and lowercase, a mix of letters and numbers, at least one special character (! @ # ? ]).",
        },
    },

    coin: {
        type: Number,
        default: 0,
    },

    theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
    },

    SearchingHistory: [String],

    cardPaymentInfo: {
        cardNumber: {
            type: String,
        },
        cardHolderName: {
            type: String,
        },
        expirationDate: {
            type: String,
        },
        cvv: {
            type: String,
        },
    },
    purchasedCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
});

module.exports = mongoose.model("User", userSchema);
