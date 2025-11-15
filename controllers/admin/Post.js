const Post = require("../../models/Post");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

// Render Admin Posts Page
exports.renderPost = async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate("author")
            .populate({
                path: "comments",
                populate: { path: "user" },
            })
            .lean();

        const postsForAdmin = posts.map((post) => ({
            _id: post._id,
            author: post.author
                ? `${post.author.firstName} ${post.author.lastName}`
                : "Unknown",
            avatar: post.author?.avatar || "/default-avatar.png",
            timeAgo: dayjs(post.createdAt).fromNow(),

            content: post.content,
            media: post.media && post.media.length > 0 ? post.media[0] : null,
            likes: post.likes,
            commentsCount: post.comments.length,
            status: post.status,
            privacy: post.privacy, // ✅ OPTIONAL but good to pass too
            comments: post.comments.map((comment) => ({
                avatar: comment.user?.avatar || "/default-avatar.png",
                name: comment.user?.firstName || "Unknown",
                text: comment.text,
            })),
        }));

        res.render("adminPost", { posts: postsForAdmin, activePage: "posts" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching posts");
    }
};

// Archive Post (Set archived = true)
exports.achievePost = async (req, res) => {
    const postId = req.params.postId;
    try {
        await Post.findByIdAndUpdate(postId, { archived: true });
        res.redirect("/admin/posts");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error archiving post");
    }
};

// Delete Post
exports.deletePost = async (req, res) => {
    const postId = req.params.postId;
    try {
        await Post.findByIdAndDelete(postId);
        res.redirect("/admin/posts");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting post");
    }
};
