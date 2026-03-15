const HackathonPost = require("../schema/HackathonPost");

const getPosts = async (req, res) => {
    try {
        const posts = await HackathonPost.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: true,
            data: posts
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { title, role, description } = req.body;
        const { username, email } = req.user;

        if (!title || !role || !description) {
            return res.status(400).json({ status: false, message: "Title, Role, and Description are required" });
        }

        const newPost = new HackathonPost({
            username,
            email,
            title,
            role,
            description
        });

        await newPost.save();
        res.status(201).json({ status: true, data: newPost });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const username = req.user.username;

        const post = await HackathonPost.findById(id);
        if (!post) {
            return res.status(404).json({ status: false, message: "Post not found" });
        }

        if (post.username !== username) {
            return res.status(403).json({ status: false, message: "You can only delete your own posts" });
        }

        await HackathonPost.findByIdAndDelete(id);
        res.status(200).json({ status: true, message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, role, description } = req.body;
        const username = req.user.username;

        const post = await HackathonPost.findById(id);
        if (!post) {
            return res.status(404).json({ status: false, message: "Post not found" });
        }

        if (post.username !== username) {
            return res.status(403).json({ status: false, message: "You can only update your own posts" });
        }

        const updatedPost = await HackathonPost.findByIdAndUpdate(
            id,
            { title, role, description },
            { new: true, runValidators: true }
        );

        res.status(200).json({ status: true, data: updatedPost });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = {
    getPosts,
    createPost,
    updatePost,
    deletePost
};
