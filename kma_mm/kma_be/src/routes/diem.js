const express = require('express');
const router = express.Router();
const DiemController = require('../controllers/diemController');

router.get('/filter', DiemController.filter);
router.get('/:id', DiemController.getById);
router.post('/', DiemController.create);
router.put('/:id', DiemController.update);
router.delete('/:id', DiemController.delete);

module.exports = router;
