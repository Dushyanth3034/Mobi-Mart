const { Product, ProductLifecycle, Inventory, Store, EolRisk, Transfer, Markdown, Sale } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const CONSTANTS = require('../utils/constants');

/**
 * Calculate distance/tier based variable transfer cost per unit (₹300 - ₹800)
 */
function calculateTransferCostPerUnit(fromStore, toStore) {
  if (!fromStore || !toStore) return 450;
  if (fromStore.city === toStore.city) {
    return CONSTANTS.TRANSFER.INTRA_CITY_COST; // ₹350
  }
  if (fromStore.tier === 'Tier-3' || toStore.tier === 'Tier-3') {
    return CONSTANTS.TRANSFER.REMOTE_TIER3_COST; // ₹780
  }
  return CONSTANTS.TRANSFER.INTER_CITY_COST; // ₹650
}

/**
 * Evaluate EOL Risk across all stores and products, compute HOLD vs TRANSFER vs MARKDOWN
 */
async function evaluateEolRisks() {
  console.log('[EOL Risk Engine] Evaluating risk and financial options for all inventory...');

  const products = await Product.findAll({
    include: [{ model: ProductLifecycle, as: 'lifecycle' }]
  });

  const stores = await Store.findAll();
  const storeMap = {};
  stores.forEach(s => { storeMap[s.id] = s; });

  const inventories = await Inventory.findAll({
    where: { is_warehouse: false, current_quantity: { [Op.gt]: 0 } },
    include: [{ model: Product, as: 'product' }]
  });

  // Recent 4-week store velocity map
  const recentSales = await Sale.findAll({
    attributes: ['store_id', 'product_id', 'units_sold'],
    where: { week_number: { [Op.gte]: 48 } }
  });
  const velocityMap = {};
  recentSales.forEach(s => {
    const key = `${s.store_id}_${s.product_id}`;
    velocityMap[key] = (velocityMap[key] || 0) + (s.units_sold / 4.0);
  });

  const riskEvaluations = [];

  for (const inv of inventories) {
    const product = inv.product;
    const store = storeMap[inv.store_id];
    if (!product || !store) continue;

    const lc = product.lifecycle || { stage: 'MATURE', eol_risk_score: 20, cannibalisation_rate: 0.5 };
    const key = `${store.id}_${product.id}`;
    const storeWeeklyVelocity = velocityMap[key] || 0.1;
    const weeksOfCover = storeWeeklyVelocity > 0 ? (inv.current_quantity / storeWeeklyVelocity) : 12.0;

    // --- 1. Compute Base Risk Score (0-100) ---
    let riskScore = 0;

    // A. Lifecycle stage contribution
    if (lc.stage === 'NEW') riskScore += 5;
    else if (lc.stage === 'GROWING') riskScore += 10;
    else if (lc.stage === 'PEAK') riskScore += 15;
    else if (lc.stage === 'MATURE') riskScore += 30;
    else if (lc.stage === 'DECLINING') riskScore += 60;
    else if (lc.stage === 'EOL_RISK') riskScore += 80;
    else if (lc.stage === 'EOL') riskScore += 95;

    // B. Rumoured vs Confirmed Successor penalty
    let successorReason = '';
    if (lc.confirmed_successor_date) {
      riskScore += 20;
      successorReason = `Confirmed successor launching on ${lc.confirmed_successor_date}.`;
    } else if (lc.rumoured_successor_date) {
      riskScore += 10;
      successorReason = `Rumoured successor expected around ${lc.rumoured_successor_date}.`;
    }

    // C. Weeks of Cover penalty
    if (weeksOfCover > 8.0) {
      riskScore += 25;
    } else if (weeksOfCover > 5.0) {
      riskScore += 15;
    }

    // D. Store misfit penalty (e.g. slow sales in budget catchment for premium device)
    let categoryFit = 0.5;
    if (product.category === 'Flagship') categoryFit = store.flagship_preference / 100.0;
    else if (product.category === 'Premium') categoryFit = store.premium_preference / 100.0;
    else if (product.category === 'Mid-range') categoryFit = store.midrange_preference / 100.0;
    else categoryFit = store.budget_preference / 100.0;

    if (categoryFit < 0.35 && (product.category === 'Flagship' || product.category === 'Premium')) {
      riskScore += 20;
    }

    riskScore = Math.min(100, Math.max(0, Math.round(riskScore)));

    // Only generate active EOL Risk records for items with Medium+ risk or excess WoC
    if (riskScore < 31 && weeksOfCover < 5.0) continue;

    // Determine Risk Tier
    let riskTier = 'Low';
    if (riskScore >= 81) riskTier = 'Critical';
    else if (riskScore >= 61) riskTier = 'High';
    else if (riskScore >= 31) riskTier = 'Medium';

    // --- 2. Calculate Financials for HOLD vs TRANSFER vs MARKDOWN ---
    const qty = inv.current_quantity;
    const unitPrice = parseFloat(product.price);
    const unitCost = parseFloat(product.cost_price);
    const totalInvValue = qty * unitCost;

    // Option A: HOLD
    // Slow clearance probability based on risk score
    const clearanceProb = Math.max(0.15, (100 - riskScore) / 100.0);
    const expectedUnsoldUnits = qty * (1 - clearanceProb);
    const depreciationRate = riskScore > 80 ? 0.45 : (riskScore > 60 ? 0.30 : 0.15);
    const holdDepreciationLoss = (qty * unitCost) * depreciationRate * (1 - clearanceProb);
    const monthsHolding = Math.min(6, Math.max(1, Math.round(weeksOfCover / 4)));
    const holdCarryingCost = totalInvValue * CONSTANTS.MONTHLY_HOLDING_COST_RATE * monthsHolding;
    const holdExpectedLoss = holdDepreciationLoss + holdCarryingCost;

    // Option B: TRANSFER
    // Find strongest candidate store in network with high demand for this category
    let bestTargetStore = null;
    let highestFitScore = -1;

    for (const otherStore of stores) {
      if (otherStore.id === store.id) continue;
      let fit = 0;
      if (product.category === 'Flagship') fit = otherStore.flagship_preference;
      else if (product.category === 'Premium') fit = otherStore.premium_preference;
      else if (product.category === 'Mid-range') fit = otherStore.midrange_preference;
      else fit = otherStore.budget_preference;

      const otherKey = `${otherStore.id}_${product.id}`;
      const otherVelocity = velocityMap[otherKey] || 0.1;

      const candidateScore = fit * 0.6 + otherVelocity * 10 * 0.4;
      if (candidateScore > highestFitScore) {
        highestFitScore = candidateScore;
        bestTargetStore = otherStore;
      }
    }

    const transferCostPerUnit = calculateTransferCostPerUnit(store, bestTargetStore);
    const totalTransferCost = qty * transferCostPerUnit;
    const targetAbsorptionRate = Math.min(0.95, (highestFitScore / 100.0) * 1.1);
    const transferGrossMarginGain = qty * targetAbsorptionRate * (unitPrice - unitCost);
    const transferExpectedNetBenefit = transferGrossMarginGain - totalTransferCost;
    // Expected loss with transfer = cost + minor salvage discount
    const transferExpectedLoss = totalTransferCost + (qty * unitCost * (1 - targetAbsorptionRate) * 0.2);

    // Option C: MARKDOWN (15% to 30% discount)
    let markdownPct = 20.0;
    if (riskScore >= 81) markdownPct = 30.0;
    else if (riskScore >= 61) markdownPct = 25.0;
    else markdownPct = 15.0;

    const discountAmountPerUnit = unitPrice * (markdownPct / 100.0);
    const markdownExpectedLoss = qty * discountAmountPerUnit;

    // --- 3. Determine Recommended Action (Minimum Expected Loss) ---
    let recommendedAction = 'HOLD';
    let minLoss = holdExpectedLoss;

    if (transferExpectedLoss < minLoss && bestTargetStore && highestFitScore > 60) {
      recommendedAction = 'TRANSFER';
      minLoss = transferExpectedLoss;
    }
    if (markdownExpectedLoss < minLoss) {
      recommendedAction = 'MARKDOWN';
      minLoss = markdownExpectedLoss;
    }

    // Compose explanatory trigger reason
    let triggerReason = `Holding ${qty} units (${weeksOfCover.toFixed(1)} WoC) with ${storeWeeklyVelocity.toFixed(1)} units/wk sales.`;
    if (successorReason) triggerReason += ` ${successorReason}`;
    if (recommendedAction === 'TRANSFER' && bestTargetStore) {
      triggerReason += ` Transferring to ${bestTargetStore.name} (${bestTargetStore.city}) saves capital vs markdown.`;
    } else if (recommendedAction === 'MARKDOWN') {
      triggerReason += ` ${markdownPct}% immediate clearance markdown minimizes dead stock write-off.`;
    }

    riskEvaluations.push({
      product_id: product.id,
      store_id: store.id,
      current_stock: qty,
      inventory_value: totalInvValue,
      weeks_of_cover: parseFloat(weeksOfCover.toFixed(1)),
      risk_score: riskScore,
      risk_tier: riskTier,
      trigger_reason: triggerReason,
      hold_expected_loss: parseFloat(holdExpectedLoss.toFixed(2)),
      hold_carrying_cost: parseFloat(holdCarryingCost.toFixed(2)),
      transfer_suggested_store_id: bestTargetStore ? bestTargetStore.id : null,
      transfer_cost: parseFloat(totalTransferCost.toFixed(2)),
      transfer_expected_net_benefit: parseFloat(transferExpectedNetBenefit.toFixed(2)),
      transfer_expected_loss: parseFloat(transferExpectedLoss.toFixed(2)),
      markdown_suggested_percentage: markdownPct,
      markdown_expected_loss: parseFloat(markdownExpectedLoss.toFixed(2)),
      recommended_action: recommendedAction,
      action_executed: false
    });
  }

  // Clear existing unexecuted risks and save refreshed evaluations
  await EolRisk.destroy({ where: { action_executed: false } });
  if (riskEvaluations.length > 0) {
    await EolRisk.bulkCreate(riskEvaluations);
  }

  console.log(`[EOL Risk Engine] Generated ${riskEvaluations.length} active EOL risk recommendations.`);
  return await EolRisk.findAll({
    include: [
      { model: Product, as: 'product' },
      { model: Store, as: 'store' },
      { model: Store, as: 'suggestedStore' }
    ],
    order: [['risk_score', 'DESC']]
  });
}

/**
 * Execute an EOL recommendation (HOLD, TRANSFER, or MARKDOWN) atomically with transaction
 */
async function executeEolAction(eolRiskId, actionType, customParams = {}) {
  const t = await sequelize.transaction();

  try {
    const eolRisk = await EolRisk.findByPk(eolRiskId, {
      include: [
        { model: Product, as: 'product' },
        { model: Store, as: 'store' },
        { model: Store, as: 'suggestedStore' }
      ],
      transaction: t
    });

    if (!eolRisk) {
      const error = new Error(`EOL Risk record #${eolRiskId} not found`);
      error.statusCode = 404;
      throw error;
    }

    if (eolRisk.action_executed) {
      await t.commit();
      return {
        success: true,
        action: eolRisk.executed_action_type || 'HOLD',
        riskId: eolRisk.id,
        alreadyExecuted: true,
        message: `Action ${eolRisk.executed_action_type} has already been executed on this record.`
      };
    }

    const chosenAction = (actionType || eolRisk.recommended_action || 'HOLD').toUpperCase();

    if (chosenAction === 'TRANSFER') {
      let targetStoreId = customParams.target_store_id || eolRisk.transfer_suggested_store_id;

      // Fallback: If no target store assigned, find any other store with high category affinity
      if (!targetStoreId) {
        const otherStore = await Store.findOne({
          where: { id: { [Op.ne]: eolRisk.store_id } },
          order: [['flagship_preference', 'DESC']],
          transaction: t
        });
        if (otherStore) targetStoreId = otherStore.id;
      }

      if (!targetStoreId) {
        const error = new Error('Target store ID required for transfer action');
        error.statusCode = 400;
        throw error;
      }

      const fromStore = eolRisk.store;
      const toStore = await Store.findByPk(targetStoreId, { transaction: t });

      if (!fromStore || !toStore) {
        const error = new Error('Source or destination store record not found');
        error.statusCode = 404;
        throw error;
      }

      const unitTransferCost = calculateTransferCostPerUnit(fromStore, toStore);
      const qtyToTransfer = eolRisk.current_stock || 1;
      const totalCost = qtyToTransfer * unitTransferCost;

      // Check and update source inventory
      const sourceInv = await Inventory.findOne({
        where: { store_id: eolRisk.store_id, product_id: eolRisk.product_id },
        transaction: t
      });

      if (sourceInv) {
        sourceInv.current_quantity = Math.max(0, sourceInv.current_quantity - qtyToTransfer);
        sourceInv.available_quantity = Math.max(0, sourceInv.available_quantity - qtyToTransfer);
        sourceInv.inventory_value = sourceInv.current_quantity * parseFloat(sourceInv.unit_cost);
        if (sourceInv.current_quantity === 0) {
          sourceInv.is_dead_stock = false;
          sourceInv.dead_stock_reason = null;
        }
        await sourceInv.save({ transaction: t });
      }

      // Check and update or create destination inventory
      let targetInv = await Inventory.findOne({
        where: { store_id: targetStoreId, product_id: eolRisk.product_id },
        transaction: t
      });

      const unitCost = eolRisk.product ? parseFloat(eolRisk.product.cost_price) : 25000;

      if (targetInv) {
        targetInv.current_quantity += qtyToTransfer;
        targetInv.available_quantity += qtyToTransfer;
        targetInv.inventory_value = targetInv.current_quantity * parseFloat(targetInv.unit_cost);
        await targetInv.save({ transaction: t });
      } else {
        await Inventory.create({
          store_id: targetStoreId,
          product_id: eolRisk.product_id,
          is_warehouse: false,
          current_quantity: qtyToTransfer,
          reserved_quantity: 0,
          available_quantity: qtyToTransfer,
          unit_cost: unitCost,
          inventory_value: qtyToTransfer * unitCost,
          weeks_of_cover: 2.5,
          last_restock_date: new Date().toISOString().split('T')[0],
          is_dead_stock: false,
          dead_stock_reason: null
        }, { transaction: t });
      }

      // Create Transfer record
      const transfer = await Transfer.create({
        product_id: eolRisk.product_id,
        from_store_id: eolRisk.store_id,
        to_store_id: targetStoreId,
        quantity: qtyToTransfer,
        cost_per_unit: unitTransferCost,
        total_transfer_cost: totalCost,
        estimated_delivery_days: CONSTANTS.TRANSFER.DELIVERY_DAYS,
        status: 'IN_TRANSIT',
        reason: `EOL Risk Mitigation: Reallocated ${qtyToTransfer} units from ${fromStore.name} to ${toStore.name} to accelerate liquidation before successor.`,
        expected_salvage_gain: eolRisk.transfer_expected_net_benefit || 0.0
      }, { transaction: t });

      eolRisk.action_executed = true;
      eolRisk.executed_action_type = 'TRANSFER';
      await eolRisk.save({ transaction: t });

      await t.commit();

      return {
        success: true,
        action: 'TRANSFER',
        riskId: eolRisk.id,
        transfer,
        message: `Transferred ${qtyToTransfer} units from ${fromStore.name} to ${toStore.name}`,
        financialImpact: {
          unitsTransferred: qtyToTransfer,
          transferCost: totalCost,
          costPerUnit: unitTransferCost,
          expectedSalvageGain: eolRisk.transfer_expected_net_benefit
        }
      };
    } else if (chosenAction === 'MARKDOWN') {
      const discountPct = Math.min(30, Math.max(15, parseFloat(customParams.discount_percentage || eolRisk.markdown_suggested_percentage || 20)));
      const originalPrice = eolRisk.product ? parseFloat(eolRisk.product.price) : 30000;
      const discountedPrice = originalPrice * (1 - discountPct / 100.0);
      const qtyToMarkdown = eolRisk.current_stock || 1;
      const totalLoss = qtyToMarkdown * (originalPrice - discountedPrice);

      const markdown = await Markdown.create({
        product_id: eolRisk.product_id,
        store_id: eolRisk.store_id,
        original_price: originalPrice,
        discount_percentage: discountPct,
        discounted_price: discountedPrice,
        affected_quantity: qtyToMarkdown,
        total_markdown_loss: totalLoss,
        status: 'ACTIVE',
        reason: `EOL Risk Mitigation: Applied ${discountPct}% price cut to liquidate ${qtyToMarkdown} units.`
      }, { transaction: t });

      eolRisk.action_executed = true;
      eolRisk.executed_action_type = 'MARKDOWN';
      await eolRisk.save({ transaction: t });

      await t.commit();

      return {
        success: true,
        action: 'MARKDOWN',
        riskId: eolRisk.id,
        markdown,
        message: `Applied ${discountPct}% markdown to ${qtyToMarkdown} units`,
        financialImpact: {
          originalValue: qtyToMarkdown * originalPrice,
          markdownPercent: discountPct,
          markdownValue: qtyToMarkdown * discountedPrice,
          markdownLoss: totalLoss
        }
      };
    } else {
      // HOLD
      eolRisk.action_executed = true;
      eolRisk.executed_action_type = 'HOLD';
      await eolRisk.save({ transaction: t });

      await t.commit();

      return {
        success: true,
        action: 'HOLD',
        riskId: eolRisk.id,
        message: `Maintained holding position for ${eolRisk.product?.model_name || 'item'} at ${eolRisk.store?.name || 'store'}.`,
        financialImpact: {
          holdingLoss: parseFloat(eolRisk.hold_expected_loss || 0),
          carryingCost: parseFloat(eolRisk.hold_carrying_cost || 0)
        }
      };
    }
  } catch (error) {
    await t.rollback();
    console.error(`[EOL Action Error] Execution failed for Risk #${eolRiskId}:`, error.message);
    throw error;
  }
}

module.exports = {
  evaluateEolRisks,
  executeEolAction,
  calculateTransferCostPerUnit
};
