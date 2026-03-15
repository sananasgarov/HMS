const express = require("express");
const router = express.Router();
const reservationRouter = require("./reservationRouter");
const authRouter = require("./authRouter");
const teamRouter = require("./teamRouter");
const hackathonRouter = require("./hackathonRouter");

router.use("/reservations", reservationRouter);
router.use("/auth", authRouter);
router.use("/teams", teamRouter);
router.use("/hackathons", hackathonRouter);

module.exports = router;
