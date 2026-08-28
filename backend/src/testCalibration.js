const { sequelize } = require('./config/database');
const { Store, Product, ProductLifecycle, Sale } = require('./models');
const { Op } = require('sequelize');

function mulberry32(seed) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function testInventoryCalibration() {
  await sequelize.authenticate();
  const stores = await Store.findAll();
  const products = await Product.findAll();
  const lifecycles = await ProductLifecycle.findAll();
  const lcMap = {};
  lifecycles.forEach(l => { lcMap[l.product_id] = l; });

  const recentSales = await Sale.findAll({
    attributes: ['store_id', 'product_id', 'units_sold'],
    where: { week_number: { [Op.gte]: 48 } }
  });

  const avgSalesMap = {};
  recentSales.forEach(s => {
    const key = `${s.store_id}_${s.product_id}`;
    avgSalesMap[key] = (avgSalesMap[key] || 0) + (s.units_sold / 4.0);
  });

  const rng = mulberry32(12345);

  let totalWarehouseValue = 0;
  let totalWarehouseUnits = 0;
  let totalStoreValue = 0;
  let totalStoreUnits = 0;

  const categoryValueMap = {
    'Flagship': 0,
    'Premium': 0,
    'Mid-range': 0,
    'Budget': 0,
    'Keypad/Budget': 0
  };

  // 1. Central Warehouse Strategic Buffer (~₹30L)
  for (const p of products) {
    const cost = parseFloat(p.cost_price);
    const lc = lcMap[p.id] || { stage: 'PEAK' };

    let whQty = 1;
    if (p.category === 'Flagship') whQty = 1;
    else if (p.category === 'Premium') whQty = 1;
    else if (p.category === 'Mid-range') whQty = 2;
    else if (p.category === 'Budget') whQty = 2;
    else if (p.category === 'Keypad/Budget') whQty = 3;

    if (lc.stage === 'DECLINING' || lc.stage === 'EOL_RISK' || lc.stage === 'EOL') {
      whQty = 1;
    }

    const val = whQty * cost;
    totalWarehouseValue += val;
    totalWarehouseUnits += whQty;
    categoryValueMap[p.category] = (categoryValueMap[p.category] || 0) + val;
  }

  // 2. 25 Stores Curated Assortments (~₹3.1 - ₹3.3 Cr)
  for (const s of stores) {
    for (const p of products) {
      const key = `${s.id}_${p.id}`;
      const weeklyVelocity = avgSalesMap[key] || 0;
      const cost = parseFloat(p.cost_price);
      const lc = lcMap[p.id] || { stage: 'PEAK' };

      let shouldStock = false;
      let qty = 0;

      if (p.category === 'Flagship') {
        if (s.tier === 'Tier-1') {
          shouldStock = s.flagship_preference >= 75 && (weeklyVelocity >= 0.25 || rng() < 0.25);
          qty = 1;
        } else if (s.tier === 'Tier-2') {
          shouldStock = s.flagship_preference >= 70 && weeklyVelocity >= 0.3;
          qty = 1;
        } else {
          shouldStock = (s.code === 'DVG-MAN-17' && p.sku.includes('S23U'));
          qty = 1;
        }
      } else if (p.category === 'Premium') {
        if (s.tier === 'Tier-1') {
          shouldStock = s.premium_preference >= 65 && (weeklyVelocity >= 0.3 || rng() < 0.3);
          qty = 1;
        } else if (s.tier === 'Tier-2') {
          shouldStock = s.premium_preference >= 70 && weeklyVelocity >= 0.35;
          qty = 1;
        } else {
          shouldStock = false;
        }
      } else if (p.category === 'Mid-range') {
        if (s.tier === 'Tier-1') {
          shouldStock = weeklyVelocity >= 0.35 || rng() < 0.25;
          qty = 1;
        } else if (s.tier === 'Tier-2') {
          shouldStock = s.midrange_preference >= 60 && (weeklyVelocity >= 0.3 || rng() < 0.3);
          qty = 1;
        } else {
          shouldStock = s.midrange_preference >= 65 && (weeklyVelocity >= 0.3 || rng() < 0.15);
          qty = 1;
        }
      } else if (p.category === 'Budget') {
        if (s.tier === 'Tier-1') {
          shouldStock = weeklyVelocity >= 0.35 || rng() < 0.25;
          qty = 1;
        } else if (s.tier === 'Tier-2') {
          shouldStock = s.budget_preference >= 60 && (weeklyVelocity >= 0.3 || rng() < 0.35);
          qty = weeklyVelocity > 1.2 ? 2 : 1;
        } else {
          shouldStock = s.budget_preference >= 60 && (weeklyVelocity >= 0.25 || rng() < 0.45);
          qty = weeklyVelocity > 1.2 ? 2 : 1;
        }
      } else if (p.category === 'Keypad/Budget') {
        if (s.tier === 'Tier-1') {
          shouldStock = s.keypad_preference >= 50 && (weeklyVelocity >= 0.3 || rng() < 0.15);
          qty = 1;
        } else if (s.tier === 'Tier-2') {
          shouldStock = s.keypad_preference >= 55 && (weeklyVelocity >= 0.3 || rng() < 0.3);
          qty = weeklyVelocity > 1.2 ? 2 : 1;
        } else {
          shouldStock = s.keypad_preference >= 55 && (weeklyVelocity >= 0.25 || rng() < 0.5);
          qty = weeklyVelocity > 1.2 ? 2 : 1;
        }
      }

      if (shouldStock && qty > 0) {
        const val = qty * cost;
        totalStoreValue += val;
        totalStoreUnits += qty;
        categoryValueMap[p.category] = (categoryValueMap[p.category] || 0) + val;
      }
    }
  }

  const totalChainValue = totalWarehouseValue + totalStoreValue;
  const budgetLimit = 40000000;
  console.log('--- CALIBRATION TEST RESULTS ---');
  console.log(`Warehouse Value:     ₹${(totalWarehouseValue / 10000000).toFixed(2)} Cr (${totalWarehouseUnits} units)`);
  console.log(`Store Network Value: ₹${(totalStoreValue / 10000000).toFixed(2)} Cr (${totalStoreUnits} units)`);
  console.log(`Total Chain Value:   ₹${(totalChainValue / 10000000).toFixed(2)} Cr (${totalWarehouseUnits + totalStoreUnits} units)`);
  console.log(`Budget Limit:        ₹${(budgetLimit / 10000000).toFixed(2)} Cr`);
  console.log(`Capital Utilization: ${((totalChainValue / budgetLimit) * 100).toFixed(1)}%`);
  console.log(`Budget Remaining:    ₹${((budgetLimit - totalChainValue) / 100000).toFixed(2)} Lakhs`);
  console.log(`Budget Status:       ${totalChainValue <= budgetLimit ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log('Category Breakdown (₹):', {
    Flagship: '₹' + (categoryValueMap['Flagship'] / 100000).toFixed(2) + ' L',
    Premium: '₹' + (categoryValueMap['Premium'] / 100000).toFixed(2) + ' L',
    'Mid-range': '₹' + (categoryValueMap['Mid-range'] / 100000).toFixed(2) + ' L',
    Budget: '₹' + (categoryValueMap['Budget'] / 100000).toFixed(2) + ' L',
    'Keypad/Budget': '₹' + (categoryValueMap['Keypad/Budget'] / 100000).toFixed(2) + ' L'
  });
}

testInventoryCalibration().then(() => process.exit(0));
