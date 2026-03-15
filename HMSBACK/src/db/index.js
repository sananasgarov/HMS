const mongoose = require("mongoose");
const config = require("../config");

let isConnected = false;

const db = async () => {
    // If already connected, skip
    if (isConnected && mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    try {
        const connUrl = config.mongodb.url.replace("<password>", config.mongodb.pass);
        
        // Disable buffering to fail fast if connection is down
        mongoose.set('bufferCommands', false);

        console.log("Connecting to MongoDB...");
        const conn = await mongoose.connect(connUrl, {
            dbName: "holberton",
            serverSelectionTimeoutMS: 10000,
        });

        isConnected = true;
        console.log("✅ MongoDB Connected Successfully");
        return conn;
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        isConnected = false;
        throw err;
    }
};

module.exports = db;

module.exports = db;