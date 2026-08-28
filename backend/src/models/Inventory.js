const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'NULL indicates Central Warehouse'
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_warehouse: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  current_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  reserved_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  available_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  unit_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
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
  last_restock_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  is_dead_stock: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dead_stock_reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'inventory',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['store_id', 'product_id', 'is_warehouse']
    },
    { fields: ['product_id'] },
    { fields: ['store_id'] },
    { fields: ['is_warehouse'] },
    { fields: ['is_dead_stock'] }
  ]
});

module.exports = Inventory;
