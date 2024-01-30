const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Please add a fullname"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
  },
  role: {
    type: String,
    enum: ["admin", "seller", "buyer", "partner"],
    default: "buyer",
  },
});

module.exports = mongoose.model("User", userSchema);
