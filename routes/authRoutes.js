const express = require("express");

const {
  registerUser,
  loginUser,
  getUser,
} = require("../controller/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/user", authMiddleware, getUser);

module.exports = router;
