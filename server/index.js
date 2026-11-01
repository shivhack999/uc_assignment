const express = require("express");
require('dotenv').config();
const prisma = require('./config/prisma.client');
const configureExpress = require("./config/expressConfig");
const allRoutes = require("./routers/router.js");

const logger = require('./utils/error/logger.js');

const app = express();

configureExpress(app);


app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
app.use("/api", allRoutes);

// Catch all errors from routes/controllers
app.use((err, req, res, next) => {
logger.error("API Error", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});


const PORT = process.env.PORT || 5001;
async function connect_db() {
  try {
    await prisma.$connect();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("database connection failed.->", error);
    process.exit(1);
  }
}
connect_db();