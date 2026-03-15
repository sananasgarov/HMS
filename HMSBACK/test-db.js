const mongoose = require('mongoose');
require('dotenv').config();

const url = "mongodb+srv://senan593az_db_user:KvI7AtNDM9yaSsSN@cluster0.lfpewid.mongodb.net/?appName=holberton";

console.log("Checking MongoDB connection...");
console.log("URL:", url.replace(/:([^@]+)@/, ':****@')); // Hide password in console

mongoose.connect(url, {
    dbName: "holberton",
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log("✅ SUCCESS: Connected to MongoDB!");
    process.exit(0);
})
.catch(err => {
    console.error("❌ FAILURE: Could not connect to MongoDB.");
    console.error("Error details:", err.message);
    console.log("\nPossible solutions:");
    console.log("1. Go to MongoDB Atlas -> Network Access -> Add '0.0.0.0/0' (Allow access from anywhere).");
    console.log("2. Check if your database user password 'KvI7AtNDM9yaSsSN' is correct.");
    console.log("3. Ensure the database name 'holberton' exists.");
    process.exit(1);
});
