const express = require("express");
const router = express.Router();
const monHocController = require("../controllers/monHocController");

router.post("/", monHocController.createMonHoc);
router.get("/", monHocController.getMonHoc);
router.put("/:ma_mon_hoc", monHocController.updateMonHoc);

module.exports = router;