const express = require("express");
const router = express.Router();
// const { verifyTokenModerator } = require("../utils/verify-token");
const { RegValidator } = require("../utils/auth-validator");
const {
  register,
  login,
  sendotp,
  verifyotp,
} = require("../controllers/auth-controller");

router.post("/register", RegValidator, register);
router.post("/send-otp", sendotp);
router.post("/verify-otp", verifyotp);
router.post("/login", login);

module.exports = router;
