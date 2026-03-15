const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    tableName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    startTime: {
        type: String, // Format: HH:mm
        required: true
    },
    endTime: {
        type: String, // Format: HH:mm
        required: true
    },
    status: {
        type: String,
        enum: ["reserved", "occupied"],
        default: "reserved"
    }
}, {
    timestamps: true
});

// Index for performance and uniqueness if needed in future
reservationSchema.index({ tableName: 1, date: 1, startTime: 1 });

const Reservation = mongoose.model("Reservation", reservationSchema);

module.exports = Reservation;
