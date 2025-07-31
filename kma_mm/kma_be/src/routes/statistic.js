const express = require('express');
const router = express.Router();
const StatisticController = require('../controllers/statisticController');

// Routes cho thống kê
router.post('/tot-nghiep', StatisticController.getThongKeTotNghiep);
router.post('/do-an', StatisticController.getThongKeDoAn);



module.exports = router;