const express = require("express");
const DanhMucKhenKyLuatController = require("../controllers/danhMucKhenKyLuatController");
const { authQuanLyHocVienMiddleWare } = require("../middelWare/authMiddelWare");
const router = express.Router();

router.post(
  "/",

  DanhMucKhenKyLuatController.create
);
router.get("/", DanhMucKhenKyLuatController.getAll);
router.get(
  "/:id",

  DanhMucKhenKyLuatController.getById
);
router.put(
  "/:id",

  DanhMucKhenKyLuatController.update
);
router.delete(
  "/:id",

  DanhMucKhenKyLuatController.delete
);

module.exports = router;
