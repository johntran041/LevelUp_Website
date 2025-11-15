const User = require("../models/User");
const Course = require("../models/Course");
const Post = require("../models/Post");
const Like = require("../models/Like");
const Comment = require("../models/Comment");

const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

exports.renderForumPage = async (req, res) => {
    try {
        const userId = req.signedCookies.userId;
        const user = await User.findById(userId).lean();

        const likes = await Like.find({ user: userId }).lean();
        const likedPostIds = likes.map((like) => like.post.toString());

        let courses = [];

        if (user.role === "Student") {
            courses = await Course.find({
                studentsEnrolled: { $in: [user._id] },
            }).lean();
        } else {
            courses = await Course.find({ author: userId }).lean();
            // console.log("Courses for student:", courses);
        }

        user.courses = courses;

        // 👥 Recommended users (exclude current)
        const users = await User.find({ _id: { $ne: userId } }).lean();
        const recommendedUsers = users.map((u) => ({
            id: u._id,
            name: `${u.firstName} ${u.lastName}`,
            avatar: u.avatar || "/default-avatar.png",
            profileUrl: `/userProfile/${u._id}`,
        }));

        // Posts
        const posts = await Post.find({})
            .populate("author")
            .populate({ path: "comments", populate: { path: "user" } })
            .sort({ createdAt: -1 })
            .lean();

        const validPosts = posts.filter((post) => {
            if (!post.author) return false;
            if (post.status === "archived") return false;
            return (
                post.privacy === "public" ||
                post.author._id.toString() === userId
            );
        });

        const postsWithWeight = validPosts
            .map((post) => {
                const ageInHours =
                    (Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60);
                const ageScore = Math.max(0, 5 - ageInHours);
                const likesScore = post.likes * 2;
                const randomScore = Math.random() * 10;
                const weight = ageScore + likesScore + randomScore;
                return { post, weight };
            })
            .sort((a, b) => b.weight - a.weight);

        const postsForView = postsWithWeight.map(({ post }) => ({
            _id: post._id,
            user: {
                id: post.author._id.toString(),
                name: `${post.author.firstName} ${post.author.lastName}`,
                avatar: post.author.avatar || "/default-avatar.png",
            },
            timeAgo: dayjs(post.createdAt).fromNow(),
            content: post.content,
            media: post.media,
            images: (post.media || []).filter((m) => !m.endsWith(".mp4")),
            videos: (post.media || []).filter((m) => m.endsWith(".mp4")),
            feelings: post.feelings,
            likes: post.likes,
            privacy: post.privacy,
            userLiked: likedPostIds.includes(post._id.toString()),
            comments: post.comments.map((comment) => ({
                user: {
                    name: comment.user?.firstName || "Unknown",
                    avatar: comment.user?.avatar || "/default-avatar.png",
                },
                text: comment.text,
            })),
        }));

        res.render("forum", {
            user,
            userId,
            posts: postsForView,
            users: recommendedUsers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
};

exports.createPost = async (req, res) => {
    try {
        const userId = req.signedCookies.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { content, privacy, feelings } = req.body;
        if (!content || content.trim() === "")
            return res.status(400).json({ message: "Content is required" });

        const mediaUrls = req.files.map((file) => file.path);
        const newPost = new Post({
            author: userId,
            content,
            media: mediaUrls,
            feelings: feelings || null,
            privacy: privacy || "public",
        });

        await newPost.save();
        res.status(201).json({ message: "Post created successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.likeAndUnlikePost = async (req, res) => {
    try {
        const userId = req.signedCookies.userId;
        const postId = req.params.postId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const existingLike = await Like.findOne({ user: userId, post: postId });
        let action = "";

        if (existingLike) {
            await existingLike.deleteOne();
            await Post.findByIdAndUpdate(postId, { $inc: { likes: -1 } });
            action = "unliked";
        } else {
            const like = new Like({ user: userId, post: postId });
            await like.save();
            await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } });
            action = "liked";
        }

        res.status(200).json({ message: "Success", action });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.renderSinglePost = async (req, res) => {
    try {
        const userId = req.signedCookies.userId;
        const postId = req.params.postId;

        const user = await User.findById(userId).lean();
        const post = await Post.findById(postId)
            .populate("author")
            .populate({
                path: "comments",
                populate: { path: "user" },
            })
            .lean();

        if (!post) return res.status(404).send("Post not found");

        const images = (post.media || []).filter((m) => !m.endsWith(".mp4"));
        const videos = (post.media || []).filter((m) => m.endsWith(".mp4"));

        // ✅ Check if user liked
        const existingLike = await Like.findOne({ user: userId, post: postId });
        const userLiked = !!existingLike;

        const comments = post.comments.map((comment) => ({
            user: {
                name: comment.user?.firstName || "Unknown",
                avatar: comment.user?.avatar || "",
            },
            text: comment.text,
        }));

        res.render("singlePost", {
            user,
            userId,
            post: {
                _id: post._id,
                user: {
                    id: post.author._id.toString(),
                    name: `${post.author.firstName} ${post.author.lastName}`,
                    avatar: post.author.avatar,
                },
                createdAt: post.createdAt,
                timeAgo: dayjs(post.createdAt).fromNow(),
                content: post.content,
                media: post.media,
                images,
                videos,
                feelings: post.feelings,
                likes: post.likes,
                privacy: post.privacy,
                userLiked, // ✅ Pass this
                comments,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};

exports.commentOnPost = async (req, res) => {
    try {
        const userId = req.signedCookies.userId;
        const postId = req.params.postId;
        const { text } = req.body;

        if (!text || !userId) return res.status(400).send("Invalid");

        const comment = new Comment({ user: userId, text });
        await comment.save();

        await Post.findByIdAndUpdate(postId, {
            $push: { comments: comment._id },
        });
        res.redirect(`/forum/${postId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};

exports.editPost = async (req, res) => {
    try {
        const { content, privacy } = req.body; // --> extract privacy also
        const postId = req.params.postId;

        const updateData = { content, privacy }; // --> add privacy here

        if (req.file) {
            updateData.media = [req.file.path];
        }

        await Post.findByIdAndUpdate(postId, updateData);
        res.json({ message: "Post updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating post" });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const userId = req.signedCookies.userId;
        const postId = req.params.postId;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).send("Post not found");
        }

        // Ensure only the author can archive the post
        if (post.author.toString() !== userId) {
            return res.status(403).send("Unauthorized to delete this post");
        }

        post.status = "archived";
        await post.save();

        res.redirect("/forum"); // or redirect back if you prefer
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting post");
    }
};
