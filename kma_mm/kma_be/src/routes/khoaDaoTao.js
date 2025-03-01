const express = require("express");
const KhoaDaoTaoController = require("../controllers/khoaDaoTaoController");
const router = express.Router();

router.post("/", KhoaDaoTaoController.create);
router.get("/", KhoaDaoTaoController.getAll);
router.get("/:id", KhoaDaoTaoController.getById);
router.put("/:id", KhoaDaoTaoController.update);
router.delete("/:id", KhoaDaoTaoController.delete);

module.exports = router;
