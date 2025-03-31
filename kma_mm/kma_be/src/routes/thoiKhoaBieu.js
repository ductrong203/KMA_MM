const express = require('express');
const router = express.Router();
const ThoiKhoaBieuController = require('../controllers/thoiKhoaBieuController');

router.get('/filter', ThoiKhoaBieuController.filter);
router.get('/filterbyid', ThoiKhoaBieuController.filterbyid);
router.get('/getbypage', ThoiKhoaBieuController.getByPage);
router.post('/createall',ThoiKhoaBieuController.createAll);
router.get('/', ThoiKhoaBieuController.getAll);
router.get('/:id', ThoiKhoaBieuController.getById);
router.post('/', ThoiKhoaBieuController.create);
router.put('/:id', ThoiKhoaBieuController.update);
router.delete('/:id', ThoiKhoaBieuController.delete);

module.exports = router;
