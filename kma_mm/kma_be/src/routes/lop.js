const express = require("express");
const LopController = require("../controllers/lopController");

const router = express.Router();

router.get("/", LopController.getAll);
router.get("/:id", LopController.getById);
router.post("/", LopController.create);
router.put("/:id", LopController.update);
router.delete("/:id", LopController.delete);

module.exports = router;
