const express = require("express");
const chungChiController = require("../controllers/chungChiController");

const router = express.Router();

router.get("/loai-chung-chi", chungChiController.layDanhSachLoaiChungChi);
router.get('/', chungChiController.layDanhSachChungChiTheoHeKhoaLop);
module.exports = router;