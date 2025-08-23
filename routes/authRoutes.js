const express = require("express");

const {
  registerUser,
  loginUser,
  getUser,
} = require("../controller/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.get("/login", loginUser);
router.get("/user", authMiddleware, getUser);

module.exports = router;
