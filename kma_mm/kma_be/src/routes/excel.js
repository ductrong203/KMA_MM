const express = require("express");
const ExcelController = require("../controllers/excelController");

const router = express.Router();

router.post("/export", ExcelController.exportSinhVienToExcel);
router.post("/exportcuoiky", ExcelController.exportSinhVienToExcelCuoiKy);

module.exports = router;