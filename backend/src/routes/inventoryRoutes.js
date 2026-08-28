const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getInventory);
router.get('/warehouse', inventoryController.getWarehouseStock);
router.get('/dead-stock', inventoryController.getDeadStock);

module.exports = router;
