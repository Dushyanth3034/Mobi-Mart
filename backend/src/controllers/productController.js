const { Product, ProductLifecycle, Inventory, Sale, Store, EolRisk } = require('../models');
const { sequelize } = require('../config/database');

exports.getAllProducts = async (req, res) => {
  try {
    // 1. Query all products with lifecycle & successor
    const productsPromise = Product.findAll({
      include: [
        {
          model: ProductLifecycle,
          as: 'lifecycle',
          include: [{ model: Product, as: 'successor', attributes: ['id', 'model_name', 'sku'] }]
        }
      ],
      order: [['category', 'ASC'], ['price', 'DESC']]
    });

    // 2. Aggregate inventory across all products in ONE single query (eliminates N+1)
    const invAggregatesPromise = Inventory.findAll({
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('current_quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('inventory_value')), 'total_value'],
        [sequelize.fn('AVG', sequelize.col('weeks_of_cover')), 'avg_woc']
      ],
      group: ['product_id'],
      raw: true
    });

    // 3. Aggregate sales across all products in ONE single query (eliminates N+1)
    const salesAggregatesPromise = Sale.findAll({
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('units_sold')), 'total_units_sold'],
        [sequelize.fn('SUM', sequelize.col('revenue')), 'total_revenue'],
        [sequelize.fn('SUM', sequelize.col('gross_profit')), 'total_gross_profit']
      ],
      group: ['product_id'],
      raw: true
    });

    // 4. Fetch active EOL risks in ONE single query
    const risksPromise = EolRisk.findAll({
      where: { action_executed: false },
      order: [['risk_score', 'DESC']],
      raw: true
    });

    const [products, invAggregates, salesAggregates, risks] = await Promise.all([
      productsPromise,
      invAggregatesPromise,
      salesAggregatesPromise,
      risksPromise
    ]);

    const invMap = {};
    invAggregates.forEach((i) => { invMap[i.product_id] = i; });

    const salesMap = {};
    salesAggregates.forEach((s) => { salesMap[s.product_id] = s; });

    const riskMap = {};
    risks.forEach((r) => {
      if (!riskMap[r.product_id]) {
        riskMap[r.product_id] = r;
      }
    });

    // Merge in memory in O(1) time
    const productStats = products.map((p) => {
      const inv = invMap[p.id] || {};
      const sales = salesMap[p.id] || {};
      const risk = riskMap[p.id];

      return {
        ...p.toJSON(),
        totalQuantity: parseInt(inv.total_quantity || 0, 10),
        inventoryValue: parseFloat(inv.total_value || 0),
        avgWeeksOfCover: parseFloat(Number(inv.avg_woc || 0).toFixed(1)),
        totalUnitsSold: parseInt(sales.total_units_sold || 0, 10),
        totalRevenue: parseFloat(sales.total_revenue || 0),
        totalGrossProfit: parseFloat(sales.total_gross_profit || 0),
        eolRisk: risk ? {
          riskScore: risk.risk_score,
          riskTier: risk.risk_tier,
          recommendedAction: risk.recommended_action,
          triggerReason: risk.trigger_reason
        } : null
      };
    });

    res.json({ success: true, count: productStats.length, data: productStats });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductLifecycle,
          as: 'lifecycle',
          include: [{ model: Product, as: 'successor', attributes: ['id', 'model_name', 'sku', 'price'] }]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: `Product #${id} not found` });
    }

    // Parallelize independent sub-queries
    const monthlySalesPromise = Sale.findAll({
      attributes: [
        'year',
        'month',
        [sequelize.fn('SUM', sequelize.col('units_sold')), 'units_sold'],
        [sequelize.fn('SUM', sequelize.col('revenue')), 'revenue'],
        [sequelize.fn('SUM', sequelize.col('gross_profit')), 'gross_profit']
      ],
      where: { product_id: id },
      group: ['year', 'month'],
      order: [['year', 'ASC'], ['month', 'ASC']],
      raw: true
    });

    let successorSalesPromise = Promise.resolve([]);
    if (product.lifecycle && product.lifecycle.successor_product_id) {
      successorSalesPromise = Sale.findAll({
        attributes: [
          'year',
          'month',
          [sequelize.fn('SUM', sequelize.col('units_sold')), 'units_sold']
        ],
        where: { product_id: product.lifecycle.successor_product_id },
        group: ['year', 'month'],
        order: [['year', 'ASC'], ['month', 'ASC']],
        raw: true
      });
    }

    const storeInventoriesPromise = Inventory.findAll({
      where: { product_id: id },
      include: [{ model: Store, as: 'store' }],
      order: [['current_quantity', 'DESC']]
    });

    const eolRiskPromise = EolRisk.findOne({
      where: { product_id: id },
      order: [['risk_score', 'DESC']]
    });

    const [monthlySales, successorMonthlySales, storeInventories, eolRisk] = await Promise.all([
      monthlySalesPromise,
      successorSalesPromise,
      storeInventoriesPromise,
      eolRiskPromise
    ]);

    res.json({
      success: true,
      data: {
        product,
        monthlySales,
        successorMonthlySales,
        storeInventories,
        eolRisk
      }
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
