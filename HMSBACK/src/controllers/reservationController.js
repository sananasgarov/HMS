const mongoose = require("mongoose");
const Reservation = require("../schema/Reservation");

const createReservation = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { tableName, date, startTime, endTime } = req.body;
        const username = req.user.username;

        if (!tableName || !date || !startTime || !endTime) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ status: false, message: "Missing required fields" });
        }

        // Rule: Cannot book for a time already passed today
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (date === todayStr && startTime < currentTime) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                status: false,
                message: `Cannot book for the past. Current time is ${currentTime}.`
            });
        }

        // Rule: A user can only have ONE active/upcoming reservation at a time for the day.
        const existingActiveRes = await Reservation.findOne({
            username,
            date,
            endTime: { $gt: currentTime }
        }).session(session);

        if (existingActiveRes) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                status: false,
                message: `You already have an active reservation (${existingActiveRes.tableName} until ${existingActiveRes.endTime}). Please wait until it ends before booking again.`
            });
        }

        // Check for overlapping reservations for this specific table (general conflict check)
        const overlapping = await Reservation.findOne({
            tableName,
            date,
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        }).session(session);

        if (overlapping) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ status: false, message: "This table is already reserved for the selected time" });
        }

        const newReservation = new Reservation({
            tableName,
            username,
            date,
            startTime,
            endTime
        });

        await newReservation.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ status: true, data: newReservation });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ status: false, message: error.message });
    }
};

const getReservations = async (req, res) => {
    try {
        const { date } = req.query;
        const query = date ? { date } : {};
        const reservations = await Reservation.find(query);
        res.status(200).json({ status: true, data: reservations });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const checkTableAvailability = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { date } = req.query;

        const targetDate = date || new Date().toISOString().split('T')[0];
        
        const reservations = await Reservation.find({ 
            tableName: tableId, 
            date: targetDate 
        }).sort({ startTime: 1 });

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const isOccupiedNow = reservations.some(res => 
            currentTime >= res.startTime && currentTime < res.endTime
        );

        res.status(200).json({
            status: true,
            data: {
                tableId,
                date: targetDate,
                isOccupiedNow,
                reservations: reservations // Send full objects with username, startTime, endTime
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const { subDays, format } = require("date-fns");

const getMyRecentReservations = async (req, res) => {
    try {
        const username = req.user.username;
        const oneWeekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
        
        const reservations = await Reservation.find({
            username,
            date: { $gte: oneWeekAgo }
        }).sort({ date: -1, startTime: -1 });

        res.status(200).json({
            status: true,
            data: reservations
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const username = req.user.username;

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ status: false, message: "Reservation not found" });
        }

        if (reservation.username !== username) {
            return res.status(403).json({ status: false, message: "You can only delete your own reservations" });
        }

        await Reservation.findByIdAndDelete(id);
        res.status(200).json({ status: true, message: "Reservation cancelled successfully" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const checkIn = async (req, res) => {
    try {
        const { tableName } = req.params;
        const username = req.user.username;
        const { currentTime, currentDate } = req.body;
        
        // Use client time if provided, otherwise fallback to server time
        const now = new Date();
        const todayStr = currentDate || now.toISOString().split('T')[0];
        const checkTime = currentTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Find an active reservation for this table and user
        const reservation = await Reservation.findOne({
            tableName,
            username,
            date: todayStr,
            startTime: { $lte: checkTime },
            endTime: { $gt: checkTime }
        });

        if (!reservation) {
            return res.status(404).json({ 
                status: false, 
                message: "No active reservation found for this desk at this time. Please make sure you have booked it." 
            });
        }

        if (reservation.status === "occupied") {
            return res.status(200).json({ status: true, message: "Already checked in", data: reservation });
        }

        reservation.status = "occupied";
        await reservation.save();

        res.status(200).json({ 
            status: true, 
            message: "Successfully checked in! The desk is now marked as Occupied.",
            data: reservation 
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = {
    createReservation,
    getReservations,
    checkTableAvailability,
    getMyRecentReservations,
    deleteReservation,
    checkIn
};
