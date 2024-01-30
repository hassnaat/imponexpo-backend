const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  accountType: {
    type: String,
    required: true,
    enum: ["individual", "corporation"],
  },
  companyName: {
    type: String,
    trim: true,
  },
  countryRegion: {
    type: String,
    required: true,
    trim: true,
  },
  reasonForSignup: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model("User", userSchema);
