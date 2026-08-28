const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('Sale', {
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
  sale_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  week_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  units_sold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  revenue: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  cost_of_goods_sold: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  gross_profit: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  is_festive_week: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  festival_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  stockout_occurred: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
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
  }
}, {
  tableName: 'sales',
  timestamps: true,
  indexes: [
    { fields: ['store_id', 'product_id', 'sale_date'] },
    { fields: ['product_id'] },
    { fields: ['store_id'] },
    { fields: ['year', 'month'] },
    { fields: ['week_number'] },
    { fields: ['is_festive_week'] },
    { fields: ['stockout_occurred'] }
  ]
});

module.exports = Sale;
