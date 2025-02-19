const express = require("express");
const KhenThuongKyLuatController = require("../controllers/khenThuongKyLuatController");

const router = express.Router();

router.post("/", KhenThuongKyLuatController.create);
router.get("/", KhenThuongKyLuatController.getAll);
router.get("/:id", KhenThuongKyLuatController.getById);
router.put("/:id", KhenThuongKyLuatController.update);
router.delete("/:id", KhenThuongKyLuatController.delete);

module.exports = router;
