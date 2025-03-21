const express = require('express');
const router = express.Router();
const KeHoachMonHocController = require('../controllers/keHoachMonHocController');

router.post("/getbykhoavaky", KeHoachMonHocController.getByKhoaDaoTaoAndKyHoc);
router.post("/monhoc", KeHoachMonHocController.getMonHocByKhoaDaoTaoAndKyHoc);
router.get('/', KeHoachMonHocController.getAll);
router.get('/:id', KeHoachMonHocController.getById);
router.post('/', KeHoachMonHocController.create);
router.put('/:id', KeHoachMonHocController.update);
router.delete('/:id', KeHoachMonHocController.delete);

module.exports = router;
