const express = require("express");
const DoiTuongQuanLyController = require("../controllers/doiTuongQuanLyController");

const router = express.Router();

router.post("/", DoiTuongQuanLyController.create);
router.get("/", DoiTuongQuanLyController.getAll);
router.get("/:id", DoiTuongQuanLyController.getById);
router.put("/:id", DoiTuongQuanLyController.update);
router.delete("/:id", DoiTuongQuanLyController.delete);

module.exports = router;