const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  brand: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  model_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('Keypad/Budget', 'Budget', 'Mid-range', 'Premium', 'Flagship'),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Selling Price (MRP) in INR'
  },
  cost_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Procurement Cost Price in INR'
  },
  margin_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 15.0
  },
  markdown_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  base_demand_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 50.0
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    { fields: ['category'] },
    { fields: ['brand'] }
  ]
});

module.exports = Product;
