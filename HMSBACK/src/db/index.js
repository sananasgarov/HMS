const mongoose = require("mongoose");
const config = require("../config");

let isConnected = false;

const db = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(
      config.mongodb.url.replace("<password>", config.mongodb.pass),
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    isConnected = conn.connections[0].readyState;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

module.exports = db;