const express = require("express");
const { register, login } = require("../controllers/auth-controller");
const { verifyTokenModerator } = require("../utils/verify-token");
const router = express.Router();

router.post("/register", verifyTokenModerator, register);
router.post("/login", login);

module.exports = router;
