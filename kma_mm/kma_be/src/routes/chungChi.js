const express = require("express");
const chungChiController = require("../controllers/chungChiController");

const router = express.Router();

router.get("/loai-chung-chi", chungChiController.layDanhSachLoaiChungChi);
router.get('/', chungChiController.layDanhSachChungChiTheoHeKhoaLop);
router.post('/', chungChiController.taoChungChi);
router.post('/:id', chungChiController.chinhSuaChungChi);
router.delete('/:id', chungChiController.xoaChungChi);
module.exports = router;