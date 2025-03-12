const express = require('express');
const router = express.Router();
const ThoiKhoaBieuController = require('../controllers/thoiKhoaBieuController');

router.get('/filter', ThoiKhoaBieuController.filter);
router.get('/getbypage', ThoiKhoaBieuController.getByPage);
router.get('/', ThoiKhoaBieuController.getAll);
router.get('/:id', ThoiKhoaBieuController.getById);
router.post('/', ThoiKhoaBieuController.create);
router.put('/:id', ThoiKhoaBieuController.update);
router.delete('/:id', ThoiKhoaBieuController.delete);

module.exports = router;
