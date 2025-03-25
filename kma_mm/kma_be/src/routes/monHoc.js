const express = require("express");
const router = express.Router();
const monHocController = require("../controllers/monHocController");

router.post("/", monHocController.createMonHoc);
router.get("/", monHocController.getMonHoc);
router.get("/chitiet", monHocController.getMonHocByIds);
router.put("/:ma_mon_hoc", monHocController.updateMonHoc);
router.get("/getByHeDaoTaoId/:id", monHocController.getTrainingById);

module.exports = router;