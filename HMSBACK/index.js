const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;
const cors = require("cors");
const router = require("./src/router/index");

app.use(cors({
  origin: true, // Allow all origins for now to fix connection issues
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: '10kb' })); 
// app.use(xss()); // Removed due to incompatibility with Express 5

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

app.use(helmet({
  crossOriginResourcePolicy: false, 
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  message: 'Həddindən artıq müraciət edildi. Zəhmət olmasa bir az sonra yenidən cəhd edin.',
  standardHeaders: true, 
  legacyHeaders: false,
});
app.use('/api', limiter); 

app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  if (req.params) req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  if (req.query) {
    const sanitizedQuery = mongoSanitize.sanitize(req.query, { replaceWith: '_' });
    for (const key in req.query) delete req.query[key];
    Object.assign(req.query, sanitizedQuery);
  }
  next();
});

app.use(hpp());

const cookieParser = require("cookie-parser");
app.use(cookieParser());
const db = require("./src/db/index");
app.use("/api", router);
db();
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});