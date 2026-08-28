const { simulateDisruptionScenario } = require('../services/scenarioService');
const { ScenarioLog, Product, Store } = require('../models');

exports.simulateScenario = async (req, res) => {
  try {
    const { daysToLaunch, storeSalesDropPct, productId, affectedStoreId } = req.body;

    const result = await simulateDisruptionScenario({
      daysToLaunch,
      storeSalesDropPct,
      productId,
      affectedStoreId
    });

    res.json({
      success: true,
      message: 'Live Defense Scenario simulated and allocation recalculated successfully.',
      data: result
    });
  } catch (error) {
    console.error('Error simulating scenario:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getScenarioHistory = async (req, res) => {
  try {
    const scenarios = await ScenarioLog.findAll({
      include: [
        { model: Product, as: 'product' },
        { model: Store, as: 'affectedStore' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, count: scenarios.length, data: scenarios });
  } catch (error) {
    console.error('Error fetching scenario history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
