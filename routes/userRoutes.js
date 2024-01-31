const express = require("express");
const {
  register,
  login,
  getUsers,
  resetPassword,
  forgotPassword,
  newPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", getUsers);
router.post("/reset-password", protect, resetPassword);
router.post("/forgot-password", forgotPassword);
router.post("/new-password", newPassword);

module.exports = router;
