const { Sale, Stockout } = require('../models');
const CONSTANTS = require('../utils/constants');

function mulberry32(seed) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seedSales = async (stores, products, lifecycles) => {
  console.log('[Seed] Generating 12 months of realistic sales history (25 stores x 70 products x 52 weeks)...');
  const rng = mulberry32(12345);

  const lifecycleMap = {};
  lifecycles.forEach(lc => {
    lifecycleMap[lc.product_id] = lc;
  });

  const salesRecords = [];
  const stockoutRecords = [];

  const startDate = new Date('2025-08-01'); // 12 months from August 2025 to July 2026

  for (let week = 1; week <= 52; week++) {
    const currentDate = new Date(startDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const saleDateStr = currentDate.toISOString().split('T')[0];
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Deterministic Festival Multiplier mapping for Karnataka retail
    let festiveMultiplier = 1.0;
    let isFestiveWeek = false;
    let festivalName = null;

    // Mysore Dussehra (Late Sept - Early Oct 2025, Weeks 8-10)
    if (week >= 8 && week <= 10) {
      festiveMultiplier = 2.5;
      isFestiveWeek = true;
      festivalName = 'Mysore Dussehra';
    }
    // Diwali Mega Festive Surge (Late Oct - Early Nov 2025, Weeks 12-14)
    else if (week >= 12 && week <= 14) {
      festiveMultiplier = 3.8;
      isFestiveWeek = true;
      festivalName = 'Diwali Mega Sale';
    }
    // Year-End / New Year Shopping Gala (Late Dec 2025, Weeks 21-22)
    else if (week >= 21 && week <= 22) {
      festiveMultiplier = 1.6;
      isFestiveWeek = true;
      festivalName = 'New Year Gala';
    }
    // Ugadi & Akshaya Tritiya (Late March - Early April 2026, Weeks 34-36)
    else if (week >= 34 && week <= 36) {
      festiveMultiplier = 1.8;
      isFestiveWeek = true;
      festivalName = 'Ugadi & Akshaya Tritiya';
    }

    for (const store of stores) {
      for (const product of products) {
        const lc = lifecycleMap[product.id] || { stage: 'MATURE', lifecycle_demand_multiplier: 1.0, cannibalisation_rate: 0.5 };

        // Store segment affinity factor (0.1 to 1.3)
        let storeCategoryFit = 0.5;
        if (product.category === 'Flagship') {
          storeCategoryFit = (store.flagship_preference / 100.0) * (store.income_score / 100.0) * 1.3;
        } else if (product.category === 'Premium') {
          storeCategoryFit = (store.premium_preference / 100.0) * (store.income_score / 100.0) * 1.2;
        } else if (product.category === 'Mid-range') {
          storeCategoryFit = (store.midrange_preference / 100.0) * 1.1;
        } else if (product.category === 'Budget') {
          storeCategoryFit = (store.budget_preference / 100.0) * 1.1;
        } else if (product.category === 'Keypad/Budget') {
          storeCategoryFit = (store.keypad_preference / 100.0) * 1.2;
        }

        // Base unit velocity per week (scaled for a realistic retail chain)
        let baseWeeklyRunRate = 0.5;
        if (product.category === 'Flagship') baseWeeklyRunRate = 0.25;
        else if (product.category === 'Premium') baseWeeklyRunRate = 0.55;
        else if (product.category === 'Mid-range') baseWeeklyRunRate = 1.20;
        else if (product.category === 'Budget') baseWeeklyRunRate = 2.20;
        else if (product.category === 'Keypad/Budget') baseWeeklyRunRate = 3.00;

        // Lifecycle multiplier
        let lifecycleFactor = lc.lifecycle_demand_multiplier;
        if (lc.stage === 'NEW') {
          const ramp = Math.min(1.0, 0.3 + (week % 10) * 0.08);
          lifecycleFactor *= ramp;
        } else if (lc.stage === 'DECLINING' || lc.stage === 'EOL_RISK' || lc.stage === 'EOL') {
          const decay = Math.max(0.25, 1.0 - (week / 52.0) * lc.cannibalisation_rate);
          lifecycleFactor *= decay;
        }

        // Seeded random variation
        const noise = 0.75 + (rng() + rng()) * 0.25;

        const expectedDemandFloat = baseWeeklyRunRate * (product.base_demand_score / 60.0) * storeCategoryFit * festiveMultiplier * lifecycleFactor * noise;

        // Poisson-like discretization
        let potentialDemand = Math.floor(expectedDemandFloat);
        if (rng() < (expectedDemandFloat - potentialDemand)) {
          potentialDemand += 1;
        }

        let stockoutOccurred = false;
        let lostUnits = 0;
        let unitsSold = potentialDemand;

        const stockoutChance = isFestiveWeek ? 0.07 : 0.035;
        if (potentialDemand > 1 && rng() < stockoutChance) {
          stockoutOccurred = true;
          lostUnits = 1;
          unitsSold = Math.max(0, potentialDemand - lostUnits);
        }

        const unitPrice = parseFloat(product.price);
        const unitCost = parseFloat(product.cost_price);
        const unitGrossProfit = unitPrice - unitCost;

        const revenue = unitsSold * unitPrice;
        const cogs = unitsSold * unitCost;
        const grossProfit = unitsSold * unitGrossProfit;

        const lostRevenue = lostUnits * unitPrice;
        const lostGrossProfit = lostUnits * unitGrossProfit;

        salesRecords.push({
          store_id: store.id,
          product_id: product.id,
          sale_date: saleDateStr,
          year,
          month,
          week_number: week,
          units_sold: unitsSold,
          revenue,
          cost_of_goods_sold: cogs,
          gross_profit: grossProfit,
          is_festive_week: isFestiveWeek,
          festival_name: festivalName,
          stockout_occurred: stockoutOccurred,
          lost_sales_units: lostUnits,
          lost_revenue: lostRevenue,
          lost_gross_profit: lostGrossProfit
        });

        if (stockoutOccurred && lostUnits > 0) {
          const sevInfo = CONSTANTS.STOCKOUT_SEVERITY[product.category] || { customerLossProb: 0.5 };
          stockoutRecords.push({
            store_id: store.id,
            product_id: product.id,
            stockout_date: saleDateStr,
            duration_days: Math.round(1 + rng() * 2),
            lost_sales_units: lostUnits,
            lost_revenue: lostRevenue,
            lost_gross_profit: lostGrossProfit,
            severity: product.category === 'Budget' || product.category === 'Keypad/Budget' ? 'HIGH' : (product.category === 'Flagship' ? 'LOW' : 'MODERATE'),
            customer_churn_risk: sevInfo.customerLossProb,
            resolved: true
          });
        }
      }
    }
  }

  console.log(`[Seed] Inserting ${salesRecords.length} sales records in batches...`);
  const batchSize = 2500;
  for (let i = 0; i < salesRecords.length; i += batchSize) {
    const batch = salesRecords.slice(i, i + batchSize);
    await Sale.bulkCreate(batch);
  }

  if (stockoutRecords.length > 0) {
    console.log(`[Seed] Inserting ${stockoutRecords.length} historical stockout incident records...`);
    for (let i = 0; i < stockoutRecords.length; i += batchSize) {
      const batch = stockoutRecords.slice(i, i + batchSize);
      await Stockout.bulkCreate(batch);
    }
  }

  console.log('[Seed] Sales history generation complete.');
};

module.exports = { seedSales };
