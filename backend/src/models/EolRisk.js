const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EolRisk = sequelize.define('EolRisk', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'NULL indicates aggregate chain-wide analysis'
  },
  current_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  inventory_value: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  weeks_of_cover: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  risk_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  risk_tier: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Low'
  },
  trigger_reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  hold_expected_loss: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  hold_carrying_cost: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  transfer_suggested_store_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  transfer_cost: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  transfer_expected_net_benefit: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  transfer_expected_loss: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  markdown_suggested_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 20.0
  },
  markdown_expected_loss: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  recommended_action: {
    type: DataTypes.ENUM('HOLD', 'TRANSFER', 'MARKDOWN'),
    allowNull: false,
    defaultValue: 'HOLD'
  },
  action_executed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  executed_action_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'eol_risks',
  timestamps: true,
  indexes: [
    { fields: ['product_id', 'store_id'] },
    { fields: ['product_id'] },
    { fields: ['store_id'] },
    { fields: ['risk_tier'] },
    { fields: ['action_executed'] },
    { fields: ['recommended_action'] }
  ]
});

module.exports = EolRisk;
