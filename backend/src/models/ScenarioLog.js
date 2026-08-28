const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScenarioLog = sequelize.define('ScenarioLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  scenario_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  affected_store_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  days_to_launch: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  demand_drop_percentage: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  units_held_before: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  stores_holding_count: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  before_state_json: {
    type: DataTypes.JSON,
    allowNull: true
  },
  after_state_json: {
    type: DataTypes.JSON,
    allowNull: true
  },
  transfer_proposals_json: {
    type: DataTypes.JSON,
    allowNull: true
  },
  capital_saved: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: true,
    defaultValue: 0.0
  },
  markdown_avoided: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: true,
    defaultValue: 0.0
  },
  explanation_text: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'scenarios',
  timestamps: true
});

module.exports = ScenarioLog;
