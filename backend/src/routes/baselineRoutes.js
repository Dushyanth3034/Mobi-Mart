const express = require('express');
const router = express.Router();
const baselineController = require('../controllers/baselineController');

router.get('/compare', baselineController.getBaselineComparison);
router.post('/run', baselineController.runBaselineSimulation);

module.exports = router;
