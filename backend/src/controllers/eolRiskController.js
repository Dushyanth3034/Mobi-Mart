const { EolRisk, Transfer, Markdown, Product, Store, ProductLifecycle } = require('../models');
const { evaluateEolRisks, executeEolAction } = require('../services/eolRiskEngine');

exports.getEolRisks = async (req, res) => {
  try {
    const { risk_tier, recommended_action } = req.query;

    const whereClause = {};
    if (risk_tier && risk_tier !== 'ALL') whereClause.risk_tier = risk_tier;
    if (recommended_action && recommended_action !== 'ALL') whereClause.recommended_action = recommended_action;

    const risks = await EolRisk.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          include: [{ model: ProductLifecycle, as: 'lifecycle' }]
        },
        { model: Store, as: 'store' },
        { model: Store, as: 'suggestedStore' }
      ],
      order: [['risk_score', 'DESC']]
    });

    res.json({ success: true, count: risks ? risks.length : 0, data: risks || [] });
  } catch (error) {
    console.error('Error fetching EOL risks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch EOL risks', error: error.message });
  }
};

exports.recalculateEolRisks = async (req, res) => {
  try {
    const risks = await evaluateEolRisks();
    res.json({
      success: true,
      message: 'EOL Risk Evaluation recalculated successfully.',
      count: risks ? risks.length : 0,
      data: risks || []
    });
  } catch (error) {
    console.error('Error recalculating EOL risks:', error);
    res.status(500).json({ success: false, message: 'Failed to recalculate EOL risks', error: error.message });
  }
};

exports.executeAction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ success: false, message: 'Invalid or missing EOL Risk ID parameter' });
    }

    const { action_type, target_store_id, discount_percentage } = req.body || {};

    const result = await executeEolAction(parseInt(id, 10), action_type, {
      target_store_id,
      discount_percentage
    });

    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error(`Error executing action on EOL Risk #${req.params.id}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Unable to execute EOL action',
      error: error.message
    });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.findAll({
      include: [
        { model: Product, as: 'product' },
        { model: Store, as: 'fromStore' },
        { model: Store, as: 'toStore' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: transfers ? transfers.length : 0, data: transfers || [] });
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transfer records', error: error.message });
  }
};

exports.getMarkdowns = async (req, res) => {
  try {
    const markdowns = await Markdown.findAll({
      include: [
        { model: Product, as: 'product' },
        { model: Store, as: 'store' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: markdowns ? markdowns.length : 0, data: markdowns || [] });
  } catch (error) {
    console.error('Error fetching markdowns:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch markdown records', error: error.message });
  }
};
