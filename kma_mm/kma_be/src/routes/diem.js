const express = require('express');
const router = express.Router();
const multer = require("multer");
const DiemController = require('../controllers/diemController');
const upload = multer({ dest: "uploads/" });

router.post("/importdiemgk", upload.single("file"), DiemController.importExcel);
router.post("/importdiemck", upload.single("file"), DiemController.importExcelCuoiKy);
router.post('/createDiemForClass', DiemController.createDiemForClass);
router.post('/them-sinh-vien-hoc-lai', DiemController.themSinhVienHocLaiVaoLop);
router.get('/filter', DiemController.filter);
router.get('/:id', DiemController.getById);
router.get('/khoadaotaovamonhoc/:khoa_dao_tao_id/:mon_hoc_id', DiemController.getByKhoaDaoTaoIdVaMonHocId);
router.post('/', DiemController.create);
router.put('/', DiemController.update);
router.delete('/:id', DiemController.delete);

module.exports = router;
