const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transfer = sequelize.define('Transfer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  from_store_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  to_store_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cost_per_unit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Variable transfer cost in range ₹300–₹800'
  },
  total_transfer_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  estimated_delivery_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  status: {
    type: DataTypes.ENUM('PROPOSED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PROPOSED'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  expected_salvage_gain: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  }
}, {
  tableName: 'transfers',
  timestamps: true,
  indexes: [
    { fields: ['from_store_id', 'to_store_id'] },
    { fields: ['product_id'] }
  ]
});

module.exports = Transfer;
