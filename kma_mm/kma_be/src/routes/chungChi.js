const express = require("express");
const chungChiController = require("../controllers/chungChiController");

const router = express.Router();

router.get("/loai-chung-chi", chungChiController.layDanhSachLoaiChungChi);
router.get('/loai-chung-chi/:id', chungChiController.layChiTietLoaiChungChi);
router.get('/', chungChiController.layDanhSachChungChiTheoHeKhoaLop);
router.post('/', chungChiController.taoChungChi);
router.post('/loai-chung-chi', chungChiController.taoLoaiChungChi);
router.put('/loai-chung-chi/:id', chungChiController.capNhatLoaiChungChi);
router.delete('/loai-chung-chi/:id', chungChiController.xoaLoaiChungChi);
router.post('/:id', chungChiController.chinhSuaChungChi);
router.delete('/:id', chungChiController.xoaChungChi);
module.exports = router;