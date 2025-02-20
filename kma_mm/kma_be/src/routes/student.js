const express = require("express");
const SinhVienController = require("../controllers/studentController");

const router = express.Router();

router.post("/", SinhVienController.create);
router.get("/", SinhVienController.getAll);
router.get("/:id", SinhVienController.getById);
router.put("/:id", SinhVienController.update);
router.delete("/:id", SinhVienController.delete);

module.exports = router;
