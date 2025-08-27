const express = require("express");

const {
  registerUser,
  loginUser,
  getUser,
  getUsersByUids,
} = require("../controller/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/user", authMiddleware, getUser);
router.post("/users/get-by-id", authMiddleware, getUsersByUids);

module.exports = router;
