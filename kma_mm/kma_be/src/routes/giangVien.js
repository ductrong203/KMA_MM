const express = require("express");
const router = express.Router();
const giangVienController = require("../controllers/giangVienController");

router.post("/", giangVienController.createGiangVien);
router.get("/", giangVienController.getGiangVien);
router.put("/:ma_giang_vien", giangVienController.updateGiangVien);

module.exports = router;