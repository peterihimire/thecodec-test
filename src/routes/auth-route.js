const express = require("express");
const { register, login, sendotp, verifyotp } = require("../controllers/auth-controller");
// const { verifyTokenModerator } = require("../utils/verify-token");
const { RegValidator } = require("../utils/auth-validator");
// const { check } = require("express-validator");
const router = express.Router();
console.log(RegValidator);
router.post("/register", RegValidator, register);
router.post("/send-otp", sendotp);
router.post("/verify-otp", verifyotp);
router.post("/login", login);

module.exports = router;
