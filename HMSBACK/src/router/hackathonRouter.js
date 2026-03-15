const express = require("express");
const router = express.Router();
const hackathonController = require("../controllers/hackathonController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes
router.get("/", authMiddleware.protect, hackathonController.getPosts);
router.post("/", authMiddleware.protect, hackathonController.createPost);
router.put("/:id", authMiddleware.protect, hackathonController.updatePost);
router.delete("/:id", authMiddleware.protect, hackathonController.deletePost);

module.exports = router;
