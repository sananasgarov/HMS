const mongoose = require("mongoose");
const config = require("../config");

const db = () => {
    mongoose
        .connect(config.mongodb.url.replace("<password>", config.mongodb.pass), {
            dbName: "holberton"
        })
        .then(() => {
            console.log("MongoDB connected");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
        });
};

module.exports = db;

module.exports = db;