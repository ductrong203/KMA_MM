const express = require('express');
const router = express.Router();
const ExportDocxController = require('../controllers/exportDocxController');

// xuất file docx
router.get('/export-ket-qua-ky-hoc', ExportDocxController.exportDocxKQHocKy);
router.get('/export-ket-qua-nam-hoc', ExportDocxController.exportDocxKQNamHoc);


module.exports = router;