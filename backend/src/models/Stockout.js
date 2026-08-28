const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Stockout = sequelize.define('Stockout', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stockout_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  lost_sales_units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lost_revenue: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  lost_gross_profit: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  severity: {
    type: DataTypes.ENUM('LOW', 'MODERATE', 'HIGH', 'CRITICAL'),
    allowNull: false,
    defaultValue: 'MODERATE'
  },
  customer_churn_risk: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'stockouts',
  timestamps: true,
  indexes: [
    { fields: ['store_id', 'product_id'] },
    { fields: ['stockout_date'] }
  ]
});

module.exports = Stockout;
