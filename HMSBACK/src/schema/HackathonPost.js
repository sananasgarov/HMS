const mongoose = require("mongoose");

const hackathonPostSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    title: {
        type: String,
        required: [true, "Hackathon title is required"],
        trim: true
    },
    role: {
        type: String,
        required: [true, "Role needed is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxlength: [2000, "Description cannot exceed 2000 characters"]
    }
}, {
    timestamps: true
});

const HackathonPost = mongoose.model("HackathonPost", hackathonPostSchema);

module.exports = HackathonPost;
