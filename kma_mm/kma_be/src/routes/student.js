const express = require("express");
const SinhVienController = require("../controllers/studentController");

const router = express.Router();

router.post("/", SinhVienController.create);
router.get("/all", SinhVienController.getAllPhanTrang); 
router.get("/", SinhVienController.getAll);
router.get("/getbylopid/:lop_id", SinhVienController.getByLopId);
router.get("/getbydoituongid/:doi_tuong_id", SinhVienController.getByDoiTuongId);
router.get("/:id", SinhVienController.getById); 
router.put("/:id", SinhVienController.update);
router.delete("/:id", SinhVienController.delete);

module.exports = router;
