const express = require("express");
const router = express.Router();
const reservationRouter = require("./reservationRouter");
const authRouter = require("./authRouter");
const teamRouter = require("./teamRouter");

router.use("/reservations", reservationRouter);
router.use("/auth", authRouter);
router.use("/teams", teamRouter);

module.exports = router;
