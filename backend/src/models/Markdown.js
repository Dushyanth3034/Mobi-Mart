const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Markdown = sequelize.define('Markdown', {
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
    comment: 'NULL indicates chain-wide markdown'
  },
  original_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: '15% to 30% markdown'
  },
  discounted_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  affected_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_markdown_loss: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PROPOSED', 'ACTIVE', 'COMPLETED'),
    allowNull: false,
    defaultValue: 'PROPOSED'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'markdowns',
  timestamps: true,
  indexes: [
    { fields: ['product_id', 'store_id'] }
  ]
});

module.exports = Markdown;
