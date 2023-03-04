const express = require("express");
const { register, login } = require("../controllers/auth-controller");
const { verifyTokenAndModerator } = require("../utils/verify-token");
const router = express.Router();

router.post("/register", verifyTokenAndModerator, register);
router.post("/login", login);

module.exports = router;
