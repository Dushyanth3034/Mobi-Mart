const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AllocationItem = sequelize.define('AllocationItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  allocation_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  current_store_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  forecast_demand_units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  recommended_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  unit_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  total_investment: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  expected_revenue: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  expected_margin: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  stockout_risk_amount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  store_demand_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 50.0
  },
  priority_tier: {
    type: DataTypes.ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
    allowNull: false,
    defaultValue: 'MEDIUM'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'allocation_items',
  timestamps: true,
  indexes: [
    { fields: ['allocation_id', 'store_id'] },
    { fields: ['allocation_id', 'product_id'] }
  ]
});

module.exports = AllocationItem;
