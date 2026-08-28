const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BaselineResult = sequelize.define('BaselineResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  run_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  month_identifier: {
    type: DataTypes.STRING(30),
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
  store_past_sales_proportion: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
    comment: 'Proportion of chain total sales in prior 30 days'
  },
  allocated_units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  stockout_events_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lost_revenue: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  dead_stock_units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  dead_stock_value: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  markdown_loss: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  }
}, {
  tableName: 'baseline_results',
  timestamps: true,
  indexes: [
    { fields: ['month_identifier'] },
    { fields: ['store_id', 'product_id'] }
  ]
});

module.exports = BaselineResult;
