const express = require('express');
const router = express.Router();
const DiemController = require('../controllers/diemController');

router.get('/getbypage', DiemController.getByPage); // Chỉ phân trang
router.get('/', DiemController.getAll); // Lấy danh sách (phân trang + lọc)
router.get('/:id', DiemController.getById); // Xem chi tiết điểm
router.post('/', DiemController.create); // Thêm điểm mới
router.put('/:id', DiemController.update); // Cập nhật điểm
router.delete('/:id', DiemController.delete); // Xóa điểm

module.exports = router;
