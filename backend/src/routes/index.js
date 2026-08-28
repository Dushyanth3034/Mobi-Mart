const express = require('express');
const router = express.Router();

const storeRoutes = require('./storeRoutes');
const productRoutes = require('./productRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const allocationRoutes = require('./allocationRoutes');
const eolRiskRoutes = require('./eolRiskRoutes');
const baselineRoutes = require('./baselineRoutes');
const scenarioRoutes = require('./scenarioRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const seedRoutes = require('./seedRoutes');

router.use('/stores', storeRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/allocation', allocationRoutes);
router.use('/eol-risk', eolRiskRoutes);
router.use('/baseline', baselineRoutes);
router.use('/scenario', scenarioRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/seed', seedRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MobiMart Inventory Optimization API',
    version: '1.0.0'
  });
});

module.exports = router;
