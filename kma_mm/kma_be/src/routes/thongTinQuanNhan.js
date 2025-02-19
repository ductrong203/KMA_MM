const express = require("express");
const ThongTinQuanNhanController = require("../controllers/thongTinQuanNhanController");

const router = express.Router();

router.post("/", ThongTinQuanNhanController.create);
router.get("/", ThongTinQuanNhanController.getAll);
router.get("/:id", ThongTinQuanNhanController.getById);
router.put("/:id", ThongTinQuanNhanController.update);
router.delete("/:id", ThongTinQuanNhanController.delete);

module.exports = router;
