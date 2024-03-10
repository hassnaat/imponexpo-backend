const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Route imports
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Routes
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
