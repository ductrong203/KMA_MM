const express = require("express");
const KhenThuongKyLuatController = require("../controllers/khenThuongKyLuatController");
const { authQuanLyHocVienMiddleWare } = require("../middelWare/authMiddelWare");
const router = express.Router();

router.post(
  "/",
  authQuanLyHocVienMiddleWare,
  KhenThuongKyLuatController.create
);
router.get("/", authQuanLyHocVienMiddleWare, KhenThuongKyLuatController.getAll);
router.get(
  "/:id",
  authQuanLyHocVienMiddleWare,
  KhenThuongKyLuatController.getById
);
router.put(
  "/:id",
  authQuanLyHocVienMiddleWare,
  KhenThuongKyLuatController.update
);
router.delete(
  "/:id",
  authQuanLyHocVienMiddleWare,
  KhenThuongKyLuatController.delete
);

module.exports = router;
