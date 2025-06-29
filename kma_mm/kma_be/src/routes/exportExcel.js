const express = require('express');
const router = express.Router();
const ExportExcelController = require('../controllers/exportExcelController');

// Lấy điểm trung bình kỳ học
router.get('/diem-trung-binh-ky-hoc', ExportExcelController.getDiemTrungBinhKyHoc);

// Xuất file Excel kết quả kỳ học
router.get('/ket-qua-ky-hoc', ExportExcelController.exportKetQuaKyHoc);

module.exports = router;
