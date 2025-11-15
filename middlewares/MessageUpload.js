const multer = require("multer");
const path = require("path");
const uploadPath = path.join(__dirname, "../uploads");

// Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const safeFilename = file.originalname
            .replace(/\s+/g, "-")
            .replace(/[^a-zA-Z0-9.-]/g, "");
        cb(null, Date.now() + "-" + safeFilename);
    },
});

// Accept images and files
const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/zip",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: function (req, file, cb) {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("File type not allowed."));
        }
    },
});

module.exports = upload;
