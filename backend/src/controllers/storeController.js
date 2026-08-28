const { Store, Inventory, Sale, Product } = require('../models');
const { getStoreProfile } = require('../services/storeProfileService');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

exports.getAllStores = async (req, res) => {
  try {
    // 1. Fetch all stores
    const storesPromise = Store.findAll({
      order: [['tier', 'ASC'], ['city', 'ASC'], ['name', 'ASC']]
    });

    // 2. Aggregate inventory across all stores in ONE single query (eliminates N+1)
    const invAggregatesPromise = Inventory.findAll({
      attributes: [
        'store_id',
        [sequelize.fn('SUM', sequelize.col('inventory_value')), 'total_inv_value'],
        [sequelize.fn('SUM', sequelize.col('current_quantity')), 'total_units'],
        [sequelize.fn('AVG', sequelize.col('weeks_of_cover')), 'avg_woc'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_dead_stock = 1 THEN inventory_value ELSE 0 END')), 'at_risk_value']
      ],
      where: { store_id: { [Op.ne]: null } },
      group: ['store_id'],
      raw: true
    });

    // 3. Aggregate sales across all stores in ONE single query (eliminates N+1)
    const salesAggregatesPromise = Sale.findAll({
      attributes: [
        'store_id',
        [sequelize.fn('SUM', sequelize.col('revenue')), 'total_revenue'],
        [sequelize.fn('SUM', sequelize.col('units_sold')), 'total_units_sold'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN stockout_occurred = 1 THEN 1 END')), 'stockout_count'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_sales_records']
      ],
      group: ['store_id'],
      raw: true
    });

    const [stores, invAggregates, salesAggregates] = await Promise.all([
      storesPromise,
      invAggregatesPromise,
      salesAggregatesPromise
    ]);

    const invMap = {};
    invAggregates.forEach((i) => { invMap[i.store_id] = i; });

    const salesMap = {};
    salesAggregates.forEach((s) => { salesMap[s.store_id] = s; });

    // Merge in memory in O(1) time
    const storeStats = stores.map((store) => {
      const inv = invMap[store.id] || {};
      const sales = salesMap[store.id] || {};
      const stockouts = parseInt(sales.stockout_count || 0, 10);
      const totalRecs = parseInt(sales.total_sales_records || 1, 10);
      const stockoutRate = parseFloat(((stockouts / totalRecs) * 100).toFixed(1));

      return {
        ...store.toJSON(),
        inventoryValue: parseFloat(inv.total_inv_value || 0),
        totalStockUnits: parseInt(inv.total_units || 0, 10),
        avgWeeksOfCover: parseFloat(Number(inv.avg_woc || 0).toFixed(1)),
        atRiskValue: parseFloat(inv.at_risk_value || 0),
        totalRevenue: parseFloat(sales.total_revenue || 0),
        totalUnitsSold: parseInt(sales.total_units_sold || 0, 10),
        stockoutRate
      };
    });

    res.json({ success: true, count: storeStats.length, data: storeStats });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    // Parallelize independent store detail queries
    const [profile, inventory, monthlySales, topProducts] = await Promise.all([
      getStoreProfile(id),
      Inventory.findAll({
        where: { store_id: id },
        include: [{ model: Product, as: 'product' }],
        order: [['inventory_value', 'DESC']]
      }),
      Sale.findAll({
        attributes: [
          'year',
          'month',
          [sequelize.fn('SUM', sequelize.col('units_sold')), 'units_sold'],
          [sequelize.fn('SUM', sequelize.col('revenue')), 'revenue'],
          [sequelize.fn('SUM', sequelize.col('gross_profit')), 'gross_profit']
        ],
        where: { store_id: id },
        group: ['year', 'month'],
        order: [['year', 'ASC'], ['month', 'ASC']],
        raw: true
      }),
      Sale.findAll({
        attributes: [
          'product_id',
          [sequelize.col('product.model_name'), 'model_name'],
          [sequelize.col('product.brand'), 'brand'],
          [sequelize.col('product.category'), 'category'],
          [sequelize.fn('SUM', sequelize.col('units_sold')), 'units_sold'],
          [sequelize.fn('SUM', sequelize.col('revenue')), 'revenue']
        ],
        include: [{ model: Product, as: 'product', attributes: [] }],
        where: { store_id: id },
        group: ['product_id', 'product.model_name', 'product.brand', 'product.category'],
        order: [[sequelize.fn('SUM', sequelize.col('revenue')), 'DESC']],
        limit: 5,
        raw: true
      })
    ]);

    res.json({
      success: true,
      data: {
        store: profile.store,
        compositeScores: profile.compositeScores,
        categorySales: profile.categorySales,
        inventory,
        monthlySales,
        topProducts
      }
    });
  } catch (error) {
    console.error('Error fetching store by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
