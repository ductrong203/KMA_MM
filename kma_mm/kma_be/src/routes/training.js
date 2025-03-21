const express = require("express");
const router = express.Router();
const trainingController = require("../controllers/trainingController");

router.post("/", trainingController.createTraining);
router.put("/:code", trainingController.updateTraining);
router.get("/", trainingController.fetchDanhSachHeDaoTao);

module.exports = router;