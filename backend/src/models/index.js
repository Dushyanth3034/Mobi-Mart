const { sequelize } = require('../config/database');

// Import all 14 models
const Store = require('./Store');
const Product = require('./Product');
const ProductLifecycle = require('./ProductLifecycle');
const Inventory = require('./Inventory');
const Sale = require('./Sale');
const Allocation = require('./Allocation');
const AllocationItem = require('./AllocationItem');
const EolRisk = require('./EolRisk');
const Transfer = require('./Transfer');
const Markdown = require('./Markdown');
const Stockout = require('./Stockout');
const BaselineResult = require('./BaselineResult');
const PerformanceMetric = require('./PerformanceMetric');
const ScenarioLog = require('./ScenarioLog');

// Define Relationships

// Product <-> ProductLifecycle (1:1)
Product.hasOne(ProductLifecycle, { foreignKey: 'product_id', as: 'lifecycle', onDelete: 'CASCADE' });
ProductLifecycle.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ProductLifecycle.belongsTo(Product, { foreignKey: 'successor_product_id', as: 'successor' });

// Store <-> Inventory (1:M)
Store.hasMany(Inventory, { foreignKey: 'store_id', as: 'inventories', onDelete: 'CASCADE' });
Inventory.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// Product <-> Inventory (1:M)
Product.hasMany(Inventory, { foreignKey: 'product_id', as: 'inventories', onDelete: 'CASCADE' });
Inventory.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Store <-> Sale (1:M)
Store.hasMany(Sale, { foreignKey: 'store_id', as: 'sales', onDelete: 'CASCADE' });
Sale.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// Product <-> Sale (1:M)
Product.hasMany(Sale, { foreignKey: 'product_id', as: 'sales', onDelete: 'CASCADE' });
Sale.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Allocation <-> AllocationItem (1:M)
Allocation.hasMany(AllocationItem, { foreignKey: 'allocation_id', as: 'items', onDelete: 'CASCADE' });
AllocationItem.belongsTo(Allocation, { foreignKey: 'allocation_id', as: 'allocation' });

// Store <-> AllocationItem (1:M)
Store.hasMany(AllocationItem, { foreignKey: 'store_id', as: 'allocations' });
AllocationItem.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// Product <-> AllocationItem (1:M)
Product.hasMany(AllocationItem, { foreignKey: 'product_id', as: 'allocations' });
AllocationItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Product <-> EolRisk (1:M)
Product.hasMany(EolRisk, { foreignKey: 'product_id', as: 'eolRisks', onDelete: 'CASCADE' });
EolRisk.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Store <-> EolRisk (1:M)
Store.hasMany(EolRisk, { foreignKey: 'store_id', as: 'eolRisks' });
EolRisk.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
EolRisk.belongsTo(Store, { foreignKey: 'transfer_suggested_store_id', as: 'suggestedStore' });

// Transfers
Product.hasMany(Transfer, { foreignKey: 'product_id', as: 'transfers' });
Transfer.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Store.hasMany(Transfer, { foreignKey: 'from_store_id', as: 'outgoingTransfers' });
Transfer.belongsTo(Store, { foreignKey: 'from_store_id', as: 'fromStore' });
Store.hasMany(Transfer, { foreignKey: 'to_store_id', as: 'incomingTransfers' });
Transfer.belongsTo(Store, { foreignKey: 'to_store_id', as: 'toStore' });

// Markdowns
Product.hasMany(Markdown, { foreignKey: 'product_id', as: 'markdowns' });
Markdown.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Store.hasMany(Markdown, { foreignKey: 'store_id', as: 'markdowns' });
Markdown.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// Stockouts
Product.hasMany(Stockout, { foreignKey: 'product_id', as: 'stockouts' });
Stockout.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Store.hasMany(Stockout, { foreignKey: 'store_id', as: 'stockouts' });
Stockout.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// Baseline Results
Product.hasMany(BaselineResult, { foreignKey: 'product_id', as: 'baselineResults' });
BaselineResult.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Store.hasMany(BaselineResult, { foreignKey: 'store_id', as: 'baselineResults' });
BaselineResult.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// Scenarios
ScenarioLog.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ScenarioLog.belongsTo(Store, { foreignKey: 'affected_store_id', as: 'affectedStore' });

module.exports = {
  sequelize,
  Store,
  Product,
  ProductLifecycle,
  Inventory,
  Sale,
  Allocation,
  AllocationItem,
  EolRisk,
  Transfer,
  Markdown,
  Stockout,
  BaselineResult,
  PerformanceMetric,
  ScenarioLog
};
