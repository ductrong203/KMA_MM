const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
// Các route xử lý đăng nhập và refresh token
router.post("/register", authController.register);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
