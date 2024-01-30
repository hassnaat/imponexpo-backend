const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Route imports
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
