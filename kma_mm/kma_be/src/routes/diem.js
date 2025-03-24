const express = require('express');
const router = express.Router();
const multer = require("multer");
const DiemController = require('../controllers/diemController');
const upload = multer({ dest: "uploads/" });

router.post("/importdiemgk", upload.single("file"), DiemController.importExcel);
router.post("/importdiemck", upload.single("file"), DiemController.importExcelCuoiKy);
router.post('/createDiemForClass', DiemController.createDiemForClass);
router.get('/filter', DiemController.filter);
router.get('/:id', DiemController.getById);
router.post('/', DiemController.create);
router.put('/', DiemController.update);
router.delete('/:id', DiemController.delete);

module.exports = router;
