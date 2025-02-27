const express = require("express");
const KhenThuongKyLuatController = require("../controllers/khenThuongKyLuatController");
const { authQuanLyHocVienMiddleWare } = require("../middelWare/authMiddelWare");
const router = express.Router();

router.post(
  "/",

  KhenThuongKyLuatController.create
);
router.get("/", authQuanLyHocVienMiddleWare, KhenThuongKyLuatController.getAll);
router.get(
  "/:id",

  KhenThuongKyLuatController.getById
);
router.put(
  "/:id",

  KhenThuongKyLuatController.update
);
router.delete(
  "/:id",

  KhenThuongKyLuatController.delete
);

module.exports = router;
