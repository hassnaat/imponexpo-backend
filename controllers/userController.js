const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const mongoose = require("mongoose");
const crypto = require("crypto");

exports.register = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    mobileNumber,
    password,
    accountType,
    companyName,
    countryRegion,
    reasonForSignup,
  } = req.body;

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new user
  const user = await User.create({
    firstName,
    lastName,
    email,
    mobileNumber,
    password: hashedPassword,
    accountType,
    companyName,
    countryRegion,
    reasonForSignup,
  });

  // Generate a token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(201).json({
    success: true,
    token,
    data: {
      id: user._id,
      firstName,
      lastName,
      email,
      mobileNumber,
      accountType,
      companyName,
      countryRegion,
      reasonForSignup,
    },
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { login, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: login }, { mobileNumber: login }],
  }).select("+password"); // To select the password field as it's not selected by default

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // Generate a token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(200).json({
    success: true,
    token,
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      accountType: user.accountType,
      companyName: user.companyName,
      countryRegion: user.countryRegion,
      reasonForSignup: user.reasonForSignup,
    },
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  // User ID is retrieved from the JWT token after the token has been verified by the auth middleware
  const userId = req.user.id;

  // Find the user in the database
  const user = await User.findById(userId).select("+password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Check if the old password matches
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Incorrect old password" });
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update the user's password
  user.password = hashedPassword;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});

const generateToken = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        reject(err);
      }
      resolve(buffer.toString("hex"));
    });
  });
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { identifier } = req.body; // 'identifier' could be email, phone number, or user ID

  let user;
  if (mongoose.isValidObjectId(identifier)) {
    // Identifier is a valid ObjectId, search by _id
    user = await User.findById(identifier);
  } else {
    // Identifier is not an ObjectId, search by email or mobileNumber
    user = await User.findOne({
      $or: [{ email: identifier }, { mobileNumber: identifier }],
    });
  }

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Generate reset token
  const resetToken = await generateToken();

  // Set reset token fields on user
  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token expires after 10 minutes
  await user.save();

  // Create reset URL or message
  const resetUrl = `https://labease.netlify.app/new-password/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please go to the following URL to reset your password: \n\n ${resetUrl}`;

  try {
    // Send email (or SMS with a similar function if using mobile number)
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, message: "Email sent" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res
      .status(500)
      .json({ success: false, message: "Email could not be sent" });
  }
});
exports.newPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;

  // Hash the token to compare with the database
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user by the hashed token and check if the token has expired
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });
  }

  // Set the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined; // Clear the reset token fields
  user.resetPasswordExpire = undefined;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ success: true, data: users });
});
