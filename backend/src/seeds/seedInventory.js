const { Inventory, Sale, ProductLifecycle } = require('../models');
const { Op } = require('sequelize');

function mulberry32(seed) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seedInventory = async (stores, products) => {
  console.log('[Seed] Generating Central Warehouse & 25 Store Inventories (Strictly bounded under ₹4.00 Cr Budget)...');
  const rng = mulberry32(12345);

  // Calculate average 4-week sales for each (store, product)
  const recentSales = await Sale.findAll({
    attributes: ['store_id', 'product_id', 'units_sold'],
    where: { week_number: { [Op.gte]: 48 } }
  });

  const avgSalesMap = {};
  recentSales.forEach(s => {
    const key = `${s.store_id}_${s.product_id}`;
    avgSalesMap[key] = (avgSalesMap[key] || 0) + (s.units_sold / 4.0);
  });

  const lifecycles = await ProductLifecycle.findAll();
  const lcMap = {};
  lifecycles.forEach(l => { lcMap[l.product_id] = l; });

  const inventoryRecords = [];
  let totalWarehouseValue = 0;
  let totalWarehouseUnits = 0;
  let totalStoreValue = 0;
  let totalStoreUnits = 0;

  // 1. Central Warehouse Strategic Reserve
  for (const product of products) {
    const unitCost = parseFloat(product.cost_price);
    const lc = lcMap[product.id] || { stage: 'PEAK' };

    let whQty = 1;
    if (product.category === 'Flagship') whQty = 1;
    else if (product.category === 'Premium') whQty = 1;
    else if (product.category === 'Mid-range') whQty = 2;
    else if (product.category === 'Budget') whQty = 2;
    else if (product.category === 'Keypad/Budget') whQty = 3;

    if (lc.stage === 'DECLINING' || lc.stage === 'EOL_RISK' || lc.stage === 'EOL') {
      whQty = 1;
    }

    const reserved = Math.round(whQty * 0.15);
    const available = whQty - reserved;
    const invValue = whQty * unitCost;

    totalWarehouseValue += invValue;
    totalWarehouseUnits += whQty;

    inventoryRecords.push({
      store_id: null,
      product_id: product.id,
      is_warehouse: true,
      current_quantity: whQty,
      reserved_quantity: reserved,
      available_quantity: available,
      unit_cost: unitCost,
      inventory_value: invValue,
      weeks_of_cover: 3.5,
      last_restock_date: '2026-08-20',
      is_dead_stock: false,
      dead_stock_reason: null
    });
  }

  // 2. Curated Assortment for 25 Stores (Bounded under ₹4.00 Cr Budget)
  for (const store of stores) {
    for (const product of products) {
      const key = `${store.id}_${product.id}`;
      const weeklyVelocity = avgSalesMap[key] || 0;
      const unitCost = parseFloat(product.cost_price);
      const lc = lcMap[product.id] || { stage: 'PEAK' };

      let shouldStock = false;
      let currentQty = 0;

      if (product.category === 'Flagship') {
        if (store.tier === 'Tier-1') {
          shouldStock = store.flagship_preference >= 75 && (weeklyVelocity >= 0.25 || rng() < 0.25);
          currentQty = 1;
        } else if (store.tier === 'Tier-2') {
          shouldStock = store.flagship_preference >= 70 && weeklyVelocity >= 0.3;
          currentQty = 1;
        } else {
          // Tier-3 store holding trapped flagship (the classic retail catchment mismatch problem)
          shouldStock = (store.code === 'DVG-MAN-17' && product.sku.includes('S23U'));
          currentQty = 1;
        }
      } else if (product.category === 'Premium') {
        if (store.tier === 'Tier-1') {
          shouldStock = store.premium_preference >= 65 && (weeklyVelocity >= 0.3 || rng() < 0.3);
          currentQty = 1;
        } else if (store.tier === 'Tier-2') {
          shouldStock = store.premium_preference >= 70 && weeklyVelocity >= 0.35;
          currentQty = 1;
        } else {
          shouldStock = false;
        }
      } else if (product.category === 'Mid-range') {
        if (store.tier === 'Tier-1') {
          shouldStock = weeklyVelocity >= 0.35 || rng() < 0.25;
          currentQty = 1;
        } else if (store.tier === 'Tier-2') {
          shouldStock = store.midrange_preference >= 60 && (weeklyVelocity >= 0.3 || rng() < 0.3);
          currentQty = 1;
        } else {
          shouldStock = store.midrange_preference >= 65 && (weeklyVelocity >= 0.3 || rng() < 0.15);
          currentQty = 1;
        }
      } else if (product.category === 'Budget') {
        if (store.tier === 'Tier-1') {
          shouldStock = weeklyVelocity >= 0.35 || rng() < 0.25;
          currentQty = 1;
        } else if (store.tier === 'Tier-2') {
          shouldStock = store.budget_preference >= 60 && (weeklyVelocity >= 0.3 || rng() < 0.35);
          currentQty = weeklyVelocity > 1.2 ? 2 : 1;
        } else {
          shouldStock = store.budget_preference >= 60 && (weeklyVelocity >= 0.25 || rng() < 0.45);
          currentQty = weeklyVelocity > 1.2 ? 2 : 1;
        }
      } else if (product.category === 'Keypad/Budget') {
        if (store.tier === 'Tier-1') {
          shouldStock = store.keypad_preference >= 50 && (weeklyVelocity >= 0.3 || rng() < 0.15);
          currentQty = 1;
        } else if (store.tier === 'Tier-2') {
          shouldStock = store.keypad_preference >= 55 && (weeklyVelocity >= 0.3 || rng() < 0.3);
          currentQty = weeklyVelocity > 1.2 ? 2 : 1;
        } else {
          shouldStock = store.keypad_preference >= 55 && (weeklyVelocity >= 0.25 || rng() < 0.5);
          currentQty = weeklyVelocity > 1.2 ? 2 : 1;
        }
      }

      if (!shouldStock || currentQty === 0) {
        inventoryRecords.push({
          store_id: store.id,
          product_id: product.id,
          is_warehouse: false,
          current_quantity: 0,
          reserved_quantity: 0,
          available_quantity: 0,
          unit_cost: unitCost,
          inventory_value: 0,
          weeks_of_cover: 0,
          last_restock_date: null,
          is_dead_stock: false,
          dead_stock_reason: null
        });
        continue;
      }

      let isDeadStock = false;
      let deadStockReason = null;

      // Check for dead stock (e.g. trapped flagship in Tier-3 or high WoC on EOL phones)
      if (store.tier === 'Tier-3' && (product.category === 'Flagship' || product.category === 'Premium')) {
        isDeadStock = true;
        deadStockReason = 'High-value flagship trapped in low-income Tier-3 catchment';
      }

      const actualWoC = weeklyVelocity > 0 ? (currentQty / weeklyVelocity) : 8.0;
      if (actualWoC >= 6.5) {
        isDeadStock = true;
        if (!deadStockReason) {
          deadStockReason = `Excess cover (${actualWoC.toFixed(1)} WoC) with low sales run-rate`;
        }
      }

      const reserved = currentQty > 3 ? 1 : 0;
      const available = Math.max(0, currentQty - reserved);
      const invValue = currentQty * unitCost;

      totalStoreValue += invValue;
      totalStoreUnits += currentQty;

      inventoryRecords.push({
        store_id: store.id,
        product_id: product.id,
        is_warehouse: false,
        current_quantity: currentQty,
        reserved_quantity: reserved,
        available_quantity: available,
        unit_cost: unitCost,
        inventory_value: invValue,
        weeks_of_cover: parseFloat(actualWoC.toFixed(1)),
        last_restock_date: '2026-08-15',
        is_dead_stock: isDeadStock,
        dead_stock_reason: deadStockReason
      });
    }
  }

  const totalChainValue = totalWarehouseValue + totalStoreValue;
  const budgetLimit = 40000000;
  const isBudgetValid = totalChainValue <= budgetLimit;

  console.log(`[Seed] Central Warehouse Value: ₹${(totalWarehouseValue / 10000000).toFixed(2)} Cr (${totalWarehouseUnits} units)`);
  console.log(`[Seed] Store Network Value:    ₹${(totalStoreValue / 10000000).toFixed(2)} Cr (${totalStoreUnits} units)`);
  console.log(`[Seed] Total Chain Value:       ₹${(totalChainValue / 10000000).toFixed(2)} Cr (Budget Ceiling: ₹4.00 Cr, Capital Utilization: ${((totalChainValue / budgetLimit) * 100).toFixed(1)}%)`);
  console.log(`[Seed] Budget Verification:     ${isBudgetValid ? 'PASS ✓' : 'FAIL ✗'}`);

  if (!isBudgetValid) {
    throw new Error(`CRITICAL BUDGET VIOLATION: Seeded inventory value (₹${totalChainValue}) exceeds ₹4.00 Cr budget ceiling!`);
  }

  await Inventory.destroy({ where: {} });
  const batchSize = 1000;
  for (let i = 0; i < inventoryRecords.length; i += batchSize) {
    const batch = inventoryRecords.slice(i, i + batchSize);
    await Inventory.bulkCreate(batch);
  }

  console.log('[Seed] Inventory generation complete.');
};

module.exports = { seedInventory };
