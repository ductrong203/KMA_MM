const express = require('express');
const router = express.Router();
const StatisticController = require('../controllers/statisticController');

// Routes cho thống kê
router.post('/tot-nghiep', StatisticController.getThongKeTotNghiep);
router.post('/do-an', StatisticController.getThongKeDoAn);
// Route báo cáo thống kê
router.post('/export-bao-cao', StatisticController.exportThongKeBaoCao);
router.post('/export-bao-cao-preview', StatisticController.getPreviewReport);



module.exports = router;