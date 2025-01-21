const express = require("express");
const router = express.Router();
const {
  authAdminMiddleWare,
  authUSerMiddleWare,
} = require("../middelWare/authMiddelWare");
const authController = require("../controllers/authController");
router.post("/register", authController.register);
router.post("/create-user", authAdminMiddleWare, authController.register);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
router.delete(
  "/delete-user/:id",
  authAdminMiddleWare,
  authController.deleteUser
);
router.get("/get-all", authAdminMiddleWare, authController.getAllUser);
router.get(
  "/get-detail-user/:id",
  authUSerMiddleWare,
  authController.getDetailUser
);
router.put("/update-user/:id", authAdminMiddleWare, authController.updateUser);
router.put(
  "/change-password/:id",
  authUSerMiddleWare,
  authController.changePassword
);
module.exports = router;
