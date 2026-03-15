const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware.protect, reservationController.createReservation);
router.get("/my-recent", authMiddleware.protect, reservationController.getMyRecentReservations);
router.delete("/:id", authMiddleware.protect, reservationController.deleteReservation);
router.get("/", reservationController.getReservations);
router.get("/:tableId/availability", reservationController.checkTableAvailability);
router.patch("/checkin/:tableName", authMiddleware.protect, reservationController.checkIn);

module.exports = router;
