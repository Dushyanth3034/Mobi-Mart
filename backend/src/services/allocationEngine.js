const { Store, Product, ProductLifecycle, Inventory, Sale, Allocation, AllocationItem } = require('../models');
const { Op } = require('sequelize');
const CONSTANTS = require('../utils/constants');
const { formatRupee } = require('../utils/formatters');

/**
 * Generate Next Monday's Weekly Allocation Plan across 25 stores and ~60+ products
 */
async function generateWeeklyAllocation(customBudget = CONSTANTS.CHAIN_INVENTORY_BUDGET) {
  console.log(`[Allocation Engine] Generating Weekly Inventory Allocation (Budget: ₹${(customBudget / 10000000).toFixed(2)} Cr)...`);

  const stores = await Store.findAll();
  const products = await Product.findAll({
    include: [{ model: ProductLifecycle, as: 'lifecycle' }]
  });

  // Get current Central Warehouse available inventory
  const warehouseInventories = await Inventory.findAll({
    where: { is_warehouse: true }
  });
  const whStockMap = {};
  warehouseInventories.forEach(wh => {
    whStockMap[wh.product_id] = {
      available: wh.available_quantity,
      unitCost: parseFloat(wh.unit_cost)
    };
  });

  // Get current Store Inventories
  const storeInventories = await Inventory.findAll({
    where: { is_warehouse: false }
  });
  const storeStockMap = {};
  let currentTotalStoreValue = 0;
  storeInventories.forEach(inv => {
    const key = `${inv.store_id}_${inv.product_id}`;
    storeStockMap[key] = {
      quantity: inv.current_quantity,
      value: parseFloat(inv.inventory_value)
    };
    currentTotalStoreValue += parseFloat(inv.inventory_value);
  });

  // Get recent 4-week sales history to compute base store-product demand run rate
  const recentSales = await Sale.findAll({
    attributes: ['store_id', 'product_id', 'units_sold'],
    where: { week_number: { [Op.gte]: 48 } }
  });
  const salesRunRateMap = {};
  recentSales.forEach(s => {
    const key = `${s.store_id}_${s.product_id}`;
    salesRunRateMap[key] = (salesRunRateMap[key] || 0) + (s.units_sold / 4.0); // average weekly sales
  });

  // Current date & upcoming week identification
  const now = new Date();
  const weekNumber = Math.ceil((now.getDate() + 6 - now.getDay()) / 7);
  const weekIdentifier = `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  const allocationDateStr = now.toISOString().split('T')[0];

  // Candidates array for allocation priority scoring
  const allocationCandidates = [];

  for (const store of stores) {
    for (const product of products) {
      const key = `${store.id}_${product.id}`;
      const avgWeeklySales = salesRunRateMap[key] || 0.2;
      const storeStock = storeStockMap[key] ? storeStockMap[key].quantity : 0;
      const unitPrice = parseFloat(product.price);
      const unitCost = parseFloat(product.cost_price);
      const marginPct = parseFloat(product.margin_percentage) / 100.0;
      const lc = product.lifecycle || { stage: 'PEAK', lifecycle_demand_multiplier: 1.0, eol_risk_score: 20 };

      // 1. Forecast next 4 weeks demand
      // Factor in store fit and lifecycle multiplier
      let storeFit = 0.5;
      if (product.category === 'Flagship') storeFit = store.flagship_preference / 100.0;
      else if (product.category === 'Premium') storeFit = store.premium_preference / 100.0;
      else if (product.category === 'Mid-range') storeFit = store.midrange_preference / 100.0;
      else if (product.category === 'Budget') storeFit = store.budget_preference / 100.0;
      else storeFit = store.keypad_preference / 100.0;

      // EOL & cannibalisation adjustment factor
      let eolDampener = 1.0;
      if (lc.stage === 'DECLINING') eolDampener = 0.65;
      else if (lc.stage === 'EOL_RISK') eolDampener = 0.35;
      else if (lc.stage === 'EOL') eolDampener = 0.10;

      // Confirmed launch dampener
      if (lc.confirmed_successor_date) eolDampener *= 0.5;
      else if (lc.rumoured_successor_date) eolDampener *= 0.8;

      const weeklyForecast = avgWeeklySales * lc.lifecycle_demand_multiplier * eolDampener;
      const fourWeekForecastUnits = Math.ceil(weeklyForecast * 4.0);

      // 2. Desired target inventory level (Target WoC = 2.5 to 3.0 weeks)
      const targetWoC = (product.category === 'Flagship' || product.category === 'Premium') ? 2.5 : 3.0;
      const targetStockUnits = Math.ceil(weeklyForecast * targetWoC);

      // Shortfall = Target - Current Stock
      const stockShortfall = Math.max(0, targetStockUnits - storeStock);

      if (stockShortfall <= 0) continue; // No replenishment needed

      // 3. Stockout Risk & Economic Severity Evaluation
      const currentWoC = weeklyForecast > 0 ? (storeStock / weeklyForecast) : 10.0;
      const stockoutSeverity = CONSTANTS.STOCKOUT_SEVERITY[product.category] || { customerLossProb: 0.5, severityWeight: 1.0 };
      const lostSalesRiskUnits = Math.max(0, fourWeekForecastUnits - storeStock);
      const stockoutRiskAmount = lostSalesRiskUnits * (unitPrice - unitCost) * stockoutSeverity.customerLossProb;

      // 4. Multi-Factor Transparent Allocation Score
      // Score = (Forecast Demand * Store Fit * Lifecycle Factor * Stockout Severity * Margin %) / EOL Risk Penalty
      const demandScore = Math.min(100, (weeklyForecast / 5.0) * 100);
      const fitFactor = Math.max(0.2, storeFit);
      const marginFactor = (marginPct * 100) / 15.0; // normalized around 15%
      const stockoutPriority = currentWoC < 1.0 ? 2.0 : (currentWoC < 2.0 ? 1.4 : 1.0);

      const allocationScore = (
        demandScore * 0.30 +
        fitFactor * 100 * 0.25 +
        stockoutPriority * 25 * 0.20 +
        marginFactor * 20 * 0.15 +
        (100 - lc.eol_risk_score) * 0.10
      );

      // Priority tier
      let priorityTier = 'MEDIUM';
      if (allocationScore >= 75 || currentWoC < 1.0) priorityTier = 'CRITICAL';
      else if (allocationScore >= 55) priorityTier = 'HIGH';
      else if (allocationScore < 35) priorityTier = 'LOW';

      // Rupee-based explanation text
      const storeFitDesc = Math.round(storeFit * 100);
      let reasonText = `${store.name} (${store.city}) 4-week demand: ${formatRupee(fourWeekForecastUnits * unitPrice)}. `;
      if (currentWoC < 1.5) {
        reasonText += `Current stock is critically lean (${currentWoC.toFixed(1)} WoC) with ${formatRupee(stockoutRiskAmount)} stockout risk. `;
      } else {
        reasonText += `Targeting ${targetWoC} weeks cover with ${storeFitDesc}/100 store category fit. `;
      }
      if (lc.confirmed_successor_date) {
        reasonText += `Allocation strictly capped due to confirmed successor on ${lc.confirmed_successor_date}.`;
      } else if (lc.stage === 'NEW' || lc.stage === 'GROWING') {
        reasonText += `High growth momentum model (${lc.stage}) with ${product.margin_percentage}% gross margin.`;
      }

      allocationCandidates.push({
        store,
        product,
        current_store_stock: storeStock,
        current_woc: parseFloat(currentWoC.toFixed(1)),
        forecast_demand_units: fourWeekForecastUnits,
        stock_shortfall: stockShortfall,
        unit_cost: unitCost,
        unit_price: unitPrice,
        margin_pct: marginPct,
        stockout_risk_amount: parseFloat(stockoutRiskAmount.toFixed(2)),
        store_demand_score: parseFloat(demandScore.toFixed(1)),
        allocation_score: allocationScore,
        priority_tier: priorityTier,
        reason: reasonText
      });
    }
  }

  // Sort candidates by allocation score descending (highest priority first)
  allocationCandidates.sort((a, b) => b.allocation_score - a.allocation_score);

  // Available Warehouse stock tracking pool
  const whStockPool = {};
  Object.keys(whStockMap).forEach(pid => {
    whStockPool[pid] = whStockMap[pid].available;
  });

  // Capital Budget Tracker
  let allocatedCapital = 0;
  const remainingBudgetCap = customBudget - currentTotalStoreValue;
  const maxAllocatableBudget = Math.max(5000000, remainingBudgetCap); // Ensure active replenishment while respecting budget ceiling

  const finalAllocatedItems = [];
  let totalUnitsAllocated = 0;
  let totalInvestment = 0;
  let expectedRevenue = 0;
  let expectedGrossMargin = 0;

  for (const item of allocationCandidates) {
    const pid = item.product.id;
    const availableInWarehouse = whStockPool[pid] || 0;

    if (availableInWarehouse <= 0) continue; // Warehouse out of stock for this SKU

    // Allocate requested shortfall or remaining warehouse stock, whichever is lower
    let qtyToAllocate = Math.min(item.stock_shortfall, availableInWarehouse);

    const investmentCost = qtyToAllocate * item.unit_cost;

    // Check budget limit
    if (totalInvestment + investmentCost > maxAllocatableBudget) {
      // Scale down if partial budget remains
      const affordableQty = Math.floor((maxAllocatableBudget - totalInvestment) / item.unit_cost);
      if (affordableQty > 0) {
        qtyToAllocate = affordableQty;
      } else {
        continue; // Budget exhausted for this item
      }
    }

    if (qtyToAllocate <= 0) continue;

    // Deduct from warehouse pool
    whStockPool[pid] -= qtyToAllocate;

    const lineInvestment = qtyToAllocate * item.unit_cost;
    const lineRevenue = qtyToAllocate * item.unit_price;
    const lineMargin = qtyToAllocate * (item.unit_price - item.unit_cost);

    totalUnitsAllocated += qtyToAllocate;
    totalInvestment += lineInvestment;
    expectedRevenue += lineRevenue;
    expectedGrossMargin += lineMargin;

    finalAllocatedItems.push({
      store_id: item.store.id,
      product_id: item.product.id,
      current_store_stock: item.current_store_stock,
      forecast_demand_units: item.forecast_demand_units,
      recommended_quantity: qtyToAllocate,
      unit_cost: item.unit_cost,
      total_investment: parseFloat(lineInvestment.toFixed(2)),
      expected_revenue: parseFloat(lineRevenue.toFixed(2)),
      expected_margin: parseFloat(lineMargin.toFixed(2)),
      stockout_risk_amount: item.stockout_risk_amount,
      store_demand_score: item.store_demand_score,
      priority_tier: item.priority_tier,
      reason: item.reason + ` Recommended investment: ${formatRupee(lineInvestment)} yielding ${formatRupee(lineMargin)} gross margin.`
    });
  }

  // Create Allocation Header in Database
  const allocation = await Allocation.create({
    allocation_date: allocationDateStr,
    week_identifier: weekIdentifier,
    total_units_allocated: totalUnitsAllocated,
    total_investment: totalInvestment,
    budget_limit: customBudget,
    budget_used_percentage: parseFloat(((totalInvestment / customBudget) * 100).toFixed(2)),
    expected_revenue: expectedRevenue,
    expected_gross_margin: expectedGrossMargin,
    status: 'APPLIED',
    algorithm_version: 'MobiMart-Opt-v1.2'
  });

  // Attach allocation_id to items and save in bulk
  const itemsToSave = finalAllocatedItems.map(item => ({
    ...item,
    allocation_id: allocation.id
  }));

  console.log(`[Allocation Engine] Saving ${itemsToSave.length} allocation line items (Total Investment: ₹${(totalInvestment / 100000).toFixed(2)} Lakhs)...`);
  const batchSize = 1000;
  for (let i = 0; i < itemsToSave.length; i += batchSize) {
    await AllocationItem.bulkCreate(itemsToSave.slice(i, i + batchSize));
  }

  console.log('[Allocation Engine] Weekly Allocation generated successfully.');
  return await Allocation.findByPk(allocation.id, {
    include: [
      {
        model: AllocationItem,
        as: 'items',
        include: [
          { model: Store, as: 'store' },
          { model: Product, as: 'product' }
        ]
      }
    ]
  });
}

/**
 * Get latest active allocation
 */
async function getLatestAllocation() {
  const latest = await Allocation.findOne({
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: AllocationItem,
        as: 'items',
        include: [
          { model: Store, as: 'store' },
          { model: Product, as: 'product' }
        ]
      }
    ]
  });
  return latest;
}

/**
 * Get allocation history for comparison between weeks
 */
async function getAllocationHistory() {
  return await Allocation.findAll({
    order: [['createdAt', 'DESC']],
    attributes: [
      'id', 'allocation_date', 'week_identifier', 'total_units_allocated',
      'total_investment', 'budget_limit', 'budget_used_percentage',
      'expected_revenue', 'expected_gross_margin', 'status', 'createdAt'
    ]
  });
}

module.exports = {
  generateWeeklyAllocation,
  getLatestAllocation,
  getAllocationHistory
};
