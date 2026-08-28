const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductLifecycle = sequelize.define('ProductLifecycle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  stage: {
    type: DataTypes.ENUM('NEW', 'GROWING', 'PEAK', 'MATURE', 'DECLINING', 'EOL_RISK', 'EOL'),
    allowNull: false,
    defaultValue: 'MATURE'
  },
  launch_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  successor_product_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  successor_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  expected_successor_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  rumoured_successor_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  confirmed_successor_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  cannibalisation_rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5,
    comment: 'Fraction of sales transferred to successor upon launch'
  },
  lifecycle_demand_multiplier: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1.0
  },
  eol_risk_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  risk_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'product_lifecycles',
  timestamps: true,
  indexes: [
    { fields: ['stage'] },
    { fields: ['successor_product_id'] }
  ]
});

module.exports = ProductLifecycle;
