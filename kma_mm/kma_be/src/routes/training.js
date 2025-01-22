const express = require("express");
const router = express.Router();
const trainingController = require("../controllers/trainingController");

router.post("/create-training", trainingController.createTraining);

module.exports = router;