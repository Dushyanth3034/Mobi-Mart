const { Store, Sale, Product } = require('../models');
const { sequelize } = require('../config/database');

/**
 * Calculate multi-factor store profile score and category affinity
 */
async function getStoreProfile(storeId) {
  const store = await Store.findByPk(storeId);
  if (!store) throw new Error(`Store with ID ${storeId} not found`);

  // Category sales distribution in the last 90 days
  const categorySales = await Sale.findAll({
    attributes: [
      [sequelize.col('product.category'), 'category'],
      [sequelize.fn('SUM', sequelize.col('Sale.units_sold')), 'total_units'],
      [sequelize.fn('SUM', sequelize.col('Sale.revenue')), 'total_revenue'],
      [sequelize.fn('SUM', sequelize.col('Sale.gross_profit')), 'total_gross_profit']
    ],
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['category']
      }
    ],
    where: { store_id: storeId },
    group: ['product.category'],
    raw: true
  });

  // Calculate composite profile scores
  const flagshipScore = Math.round((store.flagship_preference * 0.5) + (store.income_score * 0.3) + (store.footfall_score * 0.2));
  const premiumScore = Math.round((store.premium_preference * 0.4) + (store.income_score * 0.35) + (store.footfall_score * 0.25));
  const midrangeScore = Math.round((store.midrange_preference * 0.5) + (store.footfall_score * 0.3) + (store.income_score * 0.2));
  const budgetScore = Math.round((store.budget_preference * 0.6) + ((100 - store.income_score) * 0.25) + (store.footfall_score * 0.15));
  const keypadScore = Math.round((store.keypad_preference * 0.7) + ((100 - store.income_score) * 0.3));

  return {
    store,
    compositeScores: {
      flagship: Math.min(100, Math.max(0, flagshipScore)),
      premium: Math.min(100, Math.max(0, premiumScore)),
      midrange: Math.min(100, Math.max(0, midrangeScore)),
      budget: Math.min(100, Math.max(0, budgetScore)),
      keypad: Math.min(100, Math.max(0, keypadScore))
    },
    categorySales
  };
}

/**
 * Get category affinities for all stores
 */
async function getAllStoreProfiles() {
  const stores = await Store.findAll();
  return stores.map(s => ({
    id: s.id,
    code: s.code,
    name: s.name,
    city: s.city,
    tier: s.tier,
    store_type: s.store_type,
    catchment_income: s.catchment_income,
    footfall_score: s.footfall_score,
    income_score: s.income_score,
    demand_profile: s.demand_profile,
    preferences: {
      flagship: s.flagship_preference,
      premium: s.premium_preference,
      midrange: s.midrange_preference,
      budget: s.budget_preference,
      keypad: s.keypad_preference
    }
  }));
}

module.exports = {
  getStoreProfile,
  getAllStoreProfiles
};
