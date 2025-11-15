const router = require("express").Router();
const { preventAuthAccess } = require("../middlewares/auth");

const multer = require("multer");
const { forumStorage } = require("../utils/cloudinary");
const upload = multer({
    storage: forumStorage,
    limits: { fileSize: 99 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only images are allowed!"), false);
        }
        cb(null, true);
    },
});

const {
    renderForumPage,
    createPost,
    likeAndUnlikePost,
    renderSinglePost,
    commentOnPost,
    editPost,
    deletePost,
} = require("../controllers/forum");

// Render forum Page
router.get("/", renderForumPage);

// Create post
router.post("/post", upload.array("media", 1), createPost);

// Like / Unlike
router.post("/like/:postId", likeAndUnlikePost);

// Render single post
router.get("/:postId", renderSinglePost);

// Post comment
router.post("/:postId/comment", commentOnPost);

// Edit post
router.post("/edit/:postId", upload.single("media"), editPost);

// Detelte post
router.post("/delete/:postId", deletePost);

module.exports = router;
