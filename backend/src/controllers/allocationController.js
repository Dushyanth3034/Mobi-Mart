const { Allocation, AllocationItem, Store, Product, ProductLifecycle } = require('../models');
const { generateWeeklyAllocation, getLatestAllocation, getAllocationHistory } = require('../services/allocationEngine');

exports.generateAllocation = async (req, res) => {
  try {
    const { budget } = req.body;
    const allocation = await generateWeeklyAllocation(budget);
    res.json({
      success: true,
      message: "Next Monday's Inventory Allocation generated successfully.",
      data: allocation
    });
  } catch (error) {
    console.error('Error generating allocation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLatestAllocation = async (req, res) => {
  try {
    const allocation = await getLatestAllocation();
    if (!allocation) {
      // Auto-generate if not present
      const generated = await generateWeeklyAllocation();
      return res.json({ success: true, data: generated });
    }
    res.json({ success: true, data: allocation });
  } catch (error) {
    console.error('Error fetching latest allocation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllocationHistory = async (req, res) => {
  try {
    const history = await getAllocationHistory();
    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    console.error('Error fetching allocation history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const allocation = await Allocation.findByPk(id, {
      include: [
        {
          model: AllocationItem,
          as: 'items',
          include: [
            { model: Store, as: 'store' },
            { model: Product, as: 'product', include: [{ model: ProductLifecycle, as: 'lifecycle' }] }
          ]
        }
      ]
    });

    if (!allocation) {
      return res.status(404).json({ success: false, message: `Allocation #${id} not found` });
    }

    res.json({ success: true, data: allocation });
  } catch (error) {
    console.error('Error fetching allocation by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
