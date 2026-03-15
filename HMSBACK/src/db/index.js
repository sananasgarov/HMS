const mongoose = require("mongoose");
const config = require("../config");

let isConnected = false;

const db = async () => {
    if (isConnected && mongoose.connection.readyState === 1) return;

    try {
        const connUrl = config.mongodb.url.replace("<password>", config.mongodb.pass);
        
        // Disable buffering globally again just in case
        mongoose.set('bufferCommands', false);
        
        await mongoose.connect(connUrl, {
            dbName: "holberton",
            serverSelectionTimeoutMS: 5000
        });

        isConnected = true;
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        isConnected = false;
        throw err;
    }
};

module.exports = db;