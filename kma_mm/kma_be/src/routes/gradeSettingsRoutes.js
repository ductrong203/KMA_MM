const express = require('express');
const router = express.Router();
const gradeSettingsController = require('../controllers/gradeSettingsController');


// Lấy thiết lập điểm
router.get('/',  gradeSettingsController.getGradeSettings);

// Cập nhật thiết lập điểm (chỉ admin)
router.put('/',gradeSettingsController.updateGradeSettings);

module.exports = router;
