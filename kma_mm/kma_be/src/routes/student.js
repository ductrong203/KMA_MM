const express = require("express");
const SinhVienController = require("../controllers/studentController");

const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/import", upload.single("file"), SinhVienController.importSinhVien);
router.post("/", SinhVienController.create);
router.get("/all", SinhVienController.getAllPhanTrang); 
router.get("/", SinhVienController.getAll);
router.get("/tim-kiem", SinhVienController.timSinhVienTheoMaHoacFilter);
router.get("/getbylopid/:lop_id", SinhVienController.getByLopId);
router.get("/getbydoituongid/:doi_tuong_id", SinhVienController.getByDoiTuongId);
router.get("/:id", SinhVienController.getById); 
router.put("/:id", SinhVienController.update);
router.delete("/:id", SinhVienController.delete);
router.post("/export-excel", SinhVienController.exportToExcel);

module.exports = router;
