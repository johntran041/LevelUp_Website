const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const { cloudinaryKeys } = require("../configs/keys");

cloudinary.config({
    cloud_name: cloudinaryKeys.cloud_name,
    api_key: cloudinaryKeys.api_key,
    api_secret: cloudinaryKeys.api_secret,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "avatars",
        allowed_formats: ["jpg", "png", "jpeg"],
        transformation: [{ width: 300, height: 300, crop: "limit" }],
    },
});

const forumStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "forum_posts",
        allowed_formats: ["jpg", "png", "jpeg", "mp4"],
        transformation: [{ width: 1080, crop: "limit" }],
    },
});

const courseStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "courses",
        allowed_formats: ["jpg", "png", "jpeg"],
        transformation: [{ width: 1080, crop: "limit" }],
    },
});

module.exports = {
    cloudinary,
    forumStorage,
    courseStorage,
    storage,
};
