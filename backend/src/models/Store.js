const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  area: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  tier: {
    type: DataTypes.ENUM('Tier-1', 'Tier-2', 'Tier-3'),
    allowNull: false,
    defaultValue: 'Tier-2'
  },
  store_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  catchment_income: {
    type: DataTypes.ENUM('Affluent', 'Upper-Middle', 'Middle', 'Budget-conscious'),
    allowNull: false
  },
  store_size_sqft: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  footfall_level: {
    type: DataTypes.ENUM('Very High', 'High', 'Moderate', 'Low'),
    allowNull: false
  },
  footfall_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 50.0
  },
  income_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 50.0
  },
  demand_profile: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  flagship_preference: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 20.0
  },
  premium_preference: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 20.0
  },
  midrange_preference: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 30.0
  },
  budget_preference: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 20.0
  },
  keypad_preference: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 10.0
  }
}, {
  tableName: 'stores',
  timestamps: true,
  indexes: [
    { fields: ['tier'] },
    { fields: ['city'] }
  ]
});

module.exports = Store;
