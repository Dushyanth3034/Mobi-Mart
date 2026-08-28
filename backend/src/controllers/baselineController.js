const { runBaselineSimulationAndComparison, getComparisonMetrics } = require('../services/baselineService');
const { BaselineResult, Store, Product } = require('../models');

exports.getBaselineComparison = async (req, res) => {
  try {
    const metrics = await getComparisonMetrics();

    // Sample store-level baseline allocations vs actual
    const sampleResults = await BaselineResult.findAll({
      include: [
        { model: Store, as: 'store' },
        { model: Product, as: 'product' }
      ],
      limit: 50,
      order: [['dead_stock_value', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        metrics,
        sampleResults
      }
    });
  } catch (error) {
    console.error('Error fetching baseline comparison:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.runBaselineSimulation = async (req, res) => {
  try {
    const metrics = await runBaselineSimulationAndComparison();
    res.json({
      success: true,
      message: 'Naive Baseline Simulation & Benchmark recalculation completed.',
      data: metrics
    });
  } catch (error) {
    console.error('Error running baseline simulation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
