const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PerformanceMetric = sequelize.define('PerformanceMetric', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  period: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  our_stockout_rate: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  baseline_stockout_rate: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  our_weeks_of_cover: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  baseline_weeks_of_cover: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  our_dead_stock_percentage: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  baseline_dead_stock_percentage: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  our_markdown_loss: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  baseline_markdown_loss: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  our_capital_turns: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  baseline_capital_turns: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  our_gross_margin: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  baseline_gross_margin: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  our_net_inventory_roi: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  baseline_net_inventory_roi: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'performance_metrics',
  timestamps: true
});

module.exports = PerformanceMetric;
