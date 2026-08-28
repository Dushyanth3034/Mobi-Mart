const express = require('express');
const router = express.Router();
const scenarioController = require('../controllers/scenarioController');

router.post('/simulate', scenarioController.simulateScenario);
router.get('/history', scenarioController.getScenarioHistory);

module.exports = router;
