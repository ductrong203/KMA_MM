const express = require('express');
const router = express.Router();
const totNghiepController = require('../controllers/totNghiepController');

// Route xét duyệt tốt nghiệp
router.post('/approve', totNghiepController.approveGraduation);

// Route lấy danh sách tốt nghiệp với filter
router.get('/list', totNghiepController.getGraduationList);

// Route lấy thông tin tốt nghiệp của một sinh viên
router.get('/student/:sinh_vien_id', totNghiepController.getStudentGraduation);

// Route cập nhật thông tin bằng tốt nghiệp
router.put('/certificate/:graduation_id', totNghiepController.updateGraduationCertificate);

// Route lấy thống kê tốt nghiệp
router.get('/statistics', totNghiepController.getGraduationStatistics);

// Route kiểm tra trạng thái xét duyệt
router.get('/check-status', totNghiepController.checkGraduationStatus);

// Route tạo bản ghi tốt nghiệp mới
router.post('/', totNghiepController.createGraduation);

// Route xóa bản ghi tốt nghiệp
router.delete('/:graduation_id', totNghiepController.deleteGraduation);

module.exports = router;
