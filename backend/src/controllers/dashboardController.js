const { getOwnerDashboardSummary } = require('../services/dashboardService');

exports.getDashboardSummary = async (req, res) => {
  try {
    const summary = await getOwnerDashboardSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
