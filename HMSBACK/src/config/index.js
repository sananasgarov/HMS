require("dotenv").config();

module.exports = {
  mongodb: {
    url: process.env.MONGODB_URL || "",
    pass: process.env.MONGODB_PASS || "",
    user: process.env.MONGODB_USER || "",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "dev_secret_change_me",
    expiresIn: "7d",
  },
  admin: {
    username: process.env.ADMIN_USERNAME || "admin",
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    password: process.env.ADMIN_PASSWORD || "Admin123!",
  },
  intranet: {
    apiKey: process.env.INTRANET_API_KEY || "054600538e64c72a8c076183586cf1b6"
  }
};