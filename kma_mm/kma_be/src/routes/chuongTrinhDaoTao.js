const express = require("express");
const chuongTrinhDaoTaoController = require("../controllers/chuongTrinhDaoTaoController");

const router = express.Router();
router.post("/", chuongTrinhDaoTaoController.createChuongTrinhDaoTao);
router.get("/", chuongTrinhDaoTaoController.getChuongTrinhDaoTao);
router.put('/update', chuongTrinhDaoTaoController.updateChuongTrinhDaoTao);
module.exports = router;