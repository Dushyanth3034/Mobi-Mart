const { Inventory, Product, Store, ProductLifecycle } = require('../models');
const { Op } = require('sequelize');

exports.getInventory = async (req, res) => {
  try {
    const { store_id, category, is_warehouse, is_dead_stock, brand, search, page, limit } = req.query;

    const whereClause = {};
    if (store_id !== undefined && store_id !== 'ALL') {
      if (store_id === 'null' || store_id === 'warehouse' || store_id === 'WAREHOUSE') {
        whereClause.is_warehouse = true;
      } else {
        whereClause.store_id = parseInt(store_id, 10);
      }
    }
    if (is_warehouse !== undefined) {
      whereClause.is_warehouse = is_warehouse === 'true';
    }
    if (is_dead_stock !== undefined && is_dead_stock === 'true') {
      whereClause.is_dead_stock = true;
    }

    const productWhere = {};
    if (category && category !== 'ALL') {
      productWhere.category = category;
    }
    if (brand && brand !== 'ALL') {
      productWhere.brand = brand;
    }
    if (search) {
      productWhere[Op.or] = [
        { model_name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }

    const queryOptions = {
      where: whereClause,
      attributes: [
        'id',
        'store_id',
        'product_id',
        'is_warehouse',
        'current_quantity',
        'available_quantity',
        'unit_cost',
        'inventory_value',
        'weeks_of_cover',
        'is_dead_stock',
        'dead_stock_reason'
      ],
      include: [
        {
          model: Product,
          as: 'product',
          where: Object.keys(productWhere).length > 0 ? productWhere : undefined,
          attributes: ['id', 'sku', 'brand', 'model_name', 'category', 'price', 'cost_price']
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'city', 'tier']
        }
      ],
      order: [['inventory_value', 'DESC']]
    };

    if (limit) {
      const pageNum = parseInt(page || 1, 10);
      const limitNum = parseInt(limit, 10);
      queryOptions.limit = limitNum;
      queryOptions.offset = (pageNum - 1) * limitNum;
    }

    const inventories = await Inventory.findAll(queryOptions);

    res.json({ success: true, count: inventories.length, data: inventories });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWarehouseStock = async (req, res) => {
  try {
    const warehouseStock = await Inventory.findAll({
      where: { is_warehouse: true },
      attributes: [
        'id',
        'product_id',
        'current_quantity',
        'available_quantity',
        'unit_cost',
        'inventory_value',
        'weeks_of_cover',
        'is_dead_stock'
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'sku', 'brand', 'model_name', 'category', 'price']
        }
      ],
      order: [['inventory_value', 'DESC']]
    });

    let totalValue = 0;
    let totalUnits = 0;
    warehouseStock.forEach((w) => {
      totalValue += parseFloat(w.inventory_value || 0);
      totalUnits += w.current_quantity || 0;
    });

    res.json({
      success: true,
      summary: { totalValue, totalUnits, skuCount: warehouseStock.length },
      data: warehouseStock
    });
  } catch (error) {
    console.error('Error fetching warehouse stock:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDeadStock = async (req, res) => {
  try {
    const deadStock = await Inventory.findAll({
      where: { is_dead_stock: true, is_warehouse: false },
      attributes: [
        'id',
        'store_id',
        'product_id',
        'current_quantity',
        'unit_cost',
        'inventory_value',
        'weeks_of_cover',
        'dead_stock_reason'
      ],
      include: [
        { model: Product, as: 'product', attributes: ['id', 'sku', 'brand', 'model_name', 'category', 'price'] },
        { model: Store, as: 'store', attributes: ['id', 'name', 'city', 'tier'] }
      ],
      order: [['inventory_value', 'DESC']]
    });

    let totalDeadValue = 0;
    let totalDeadUnits = 0;
    deadStock.forEach((d) => {
      totalDeadValue += parseFloat(d.inventory_value || 0);
      totalDeadUnits += d.current_quantity || 0;
    });

    res.json({
      success: true,
      summary: { totalDeadValue, totalDeadUnits, count: deadStock.length },
      data: deadStock
    });
  } catch (error) {
    console.error('Error fetching dead stock:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
