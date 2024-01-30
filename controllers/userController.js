const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const { fullname, email, password } = req.body;

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new user
  const user = await User.create({
    fullname,
    email,
    password: hashedPassword,
  });

  // Generate a token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(201).json({
    success: true,
    token,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check for user by email
  const user = await User.findOne({ email }).select("+password");
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
  });
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ success: true, data: users });
});
