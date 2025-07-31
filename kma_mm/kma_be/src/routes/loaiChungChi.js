const express = require('express');
const router = express.Router();
const LoaiChungChiController = require('../controllers/loaiChungChiController');


// Routes cho quản lý loại chứng chỉ
/**
 * @route GET /api/loai-chung-chi
 * @desc Lấy danh sách loại chứng chỉ
 * @access Private
 * @query {string} [tinh_trang] - Lọc theo tình trạng (hoạt động/tạm dừng)
 */
router.get('/', LoaiChungChiController.layDanhSachLoaiChungChi);

/**
 * @route GET /api/loai-chung-chi/tim-kiem
 * @desc Tìm kiếm loại chứng chỉ
 * @access Private
 * @query {string} tu_khoa - Từ khóa tìm kiếm
 */
router.get('/tim-kiem', LoaiChungChiController.timKiemLoaiChungChi);

/**
 * @route GET /api/loai-chung-chi/:id
 * @desc Lấy chi tiết loại chứng chỉ theo ID
 * @access Private
 * @param {number} id - ID của loại chứng chỉ
 */
router.get('/:id', LoaiChungChiController.layChiTietLoaiChungChi);

/**
 * @route POST /api/loai-chung-chi
 * @desc Tạo loại chứng chỉ mới
 * @access Private
 * @body {string} ten_loai_chung_chi - Tên loại chứng chỉ
 * @body {string} [mo_ta] - Mô tả
 * @body {boolean} [xet_tot_nghiep] - Có được xét tốt nghiệp
 * @body {string} [tinh_trang] - Tình trạng (hoạt động/tạm dừng)
 */
router.post('/', LoaiChungChiController.taoLoaiChungChi);

/**
 * @route PUT /api/loai-chung-chi/:id
 * @desc Cập nhật loại chứng chỉ
 * @access Private
 * @param {number} id - ID của loại chứng chỉ
 * @body {string} [ten_loai_chung_chi] - Tên loại chứng chỉ
 * @body {string} [mo_ta] - Mô tả
 * @body {boolean} [xet_tot_nghiep] - Có được xét tốt nghiệp
 * @body {string} [tinh_trang] - Tình trạng (hoạt động/tạm dừng)
 */
router.put('/:id', LoaiChungChiController.capNhatLoaiChungChi);

/**
 * @route PATCH /api/loai-chung-chi/:id/trang-thai
 * @desc Thay đổi trạng thái loại chứng chỉ
 * @access Private
 * @param {number} id - ID của loại chứng chỉ
 * @body {string} tinh_trang - Tình trạng mới (hoạt động/tạm dừng)
 */
router.patch('/:id/trang-thai', LoaiChungChiController.thayDoiTrangThaiLoaiChungChi);

/**
 * @route DELETE /api/loai-chung-chi/:id
 * @desc Xóa loại chứng chỉ
 * @access Private
 * @param {number} id - ID của loại chứng chỉ
 */
router.delete('/:id', LoaiChungChiController.xoaLoaiChungChi);

module.exports = router;
