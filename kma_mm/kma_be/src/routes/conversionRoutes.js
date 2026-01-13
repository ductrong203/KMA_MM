const express = require('express');
const router = express.Router();
const conversionController = require('../controllers/conversionController');

router.get('/', conversionController.getConversionRules);
router.post('/', conversionController.createConversionRule);
router.put('/:id', conversionController.updateConversionRule);
router.delete('/:id', conversionController.deleteConversionRule);

module.exports = router;
