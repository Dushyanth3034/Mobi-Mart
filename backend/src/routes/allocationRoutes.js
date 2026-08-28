const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');

router.post('/generate', allocationController.generateAllocation);
router.get('/latest', allocationController.getLatestAllocation);
router.get('/history', allocationController.getAllocationHistory);
router.get('/:id', allocationController.getAllocationById);

module.exports = router;
