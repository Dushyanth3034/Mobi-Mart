const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Allocation = sequelize.define('Allocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  allocation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  week_identifier: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  total_units_allocated: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_investment: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  budget_limit: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 40000000.00
  },
  budget_used_percentage: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  expected_revenue: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  expected_gross_margin: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.0
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'APPLIED', 'HISTORICAL'),
    allowNull: false,
    defaultValue: 'APPLIED'
  },
  algorithm_version: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'MobiMart-Opt-v1'
  }
}, {
  tableName: 'allocations',
  timestamps: true
});

module.exports = Allocation;
