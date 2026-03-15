const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes
router.get("/cohorts", authMiddleware.protect, teamController.getCohorts);
router.get("/my-team", authMiddleware.protect, teamController.getMyTeam);

module.exports = router;
