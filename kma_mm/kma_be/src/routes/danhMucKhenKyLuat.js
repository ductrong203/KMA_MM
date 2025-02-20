const express = require("express");
const DanhMucKhenKyLuatController = require("../controllers/danhMucKhenKyLuatController");
const { authQuanLyHocVienMiddleWare } = require("../middelWare/authMiddelWare");
const router = express.Router();

router.post(
  "/",
  authQuanLyHocVienMiddleWare,
  DanhMucKhenKyLuatController.create
);
router.get(
  "/",
  authQuanLyHocVienMiddleWare,
  DanhMucKhenKyLuatController.getAll
);
router.get(
  "/:id",
  authQuanLyHocVienMiddleWare,
  DanhMucKhenKyLuatController.getById
);
router.put(
  "/:id",
  authQuanLyHocVienMiddleWare,
  DanhMucKhenKyLuatController.update
);
router.delete(
  "/:id",
  authQuanLyHocVienMiddleWare,
  DanhMucKhenKyLuatController.delete
);

module.exports = router;
