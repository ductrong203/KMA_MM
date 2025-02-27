const express = require("express");
const ThongTinQuanNhanController = require("../controllers/thongTinQuanNhanController");

const router = express.Router();

router.post("/", ThongTinQuanNhanController.create);
router.get("/", ThongTinQuanNhanController.getAll);
router.get("/:id", ThongTinQuanNhanController.getById);
router.get("/byidsinhvien/:id", ThongTinQuanNhanController.getByIdSinhVien);
router.put("/:id", ThongTinQuanNhanController.update);
router.put("/byidsinhvien/:id", ThongTinQuanNhanController.updateByIdSinhVien);
router.delete("/:id", ThongTinQuanNhanController.delete);

module.exports = router;
