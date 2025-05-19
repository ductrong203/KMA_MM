const express = require('express');
const router = express.Router();
const ExcelPhuLucBangController = require('../controllers/excelPhuLucBangController');

// Lấy dữ liệu phụ lục bảng điểm
router.get('/data', ExcelPhuLucBangController.getDataPhuLucBang);
// Lấy thông tin số kỳ học và khóa đào tạo
router.get('/info', ExcelPhuLucBangController.getSoKyHocVaKhoa);
// Xuất file Excel phụ lục bảng điểm
router.get('/export', ExcelPhuLucBangController.exportExcelPhuLucBang);

module.exports = router;