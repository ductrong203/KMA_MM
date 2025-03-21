const express = require("express");
const router = express.Router();
const phongBanController = require("../controllers/phongBanController");

router.post("/", phongBanController.createPhongBan);
router.get("/", phongBanController.getPhongBan);
router.put("/:code", phongBanController.updatePhongBan);

module.exports = router;