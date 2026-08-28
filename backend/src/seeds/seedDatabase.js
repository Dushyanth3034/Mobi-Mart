const { sequelize, testConnection } = require('../config/database');
const { seedStores } = require('./seedStores');
const { seedProducts } = require('./seedProducts');
const { seedLifecycle } = require('./seedLifecycle');
const { seedSales } = require('./seedSales');
const { seedInventory } = require('./seedInventory');
const { evaluateEolRisks } = require('../services/eolRiskEngine');
const { generateWeeklyAllocation } = require('../services/allocationEngine');
const { runBaselineSimulationAndComparison } = require('../services/baselineService');
const { simulateDisruptionScenario } = require('../services/scenarioService');
const { Inventory } = require('../models');

async function runSeed() {
  console.log('===============================================================');
  console.log('       MOBIMART - DETERMINISTIC DATABASE SEED GENERATOR        ');
  console.log('===============================================================');

  try {
    // 1. Test MySQL connection
    await testConnection();

    // 2. Synchronize all 14 Sequelize Models
    console.log('[Seed] Syncing database schema (14 tables)...');
    await sequelize.sync({ force: true });
    console.log('[Seed] Schema synchronized successfully.');

    // 3. Seed 25 Stores
    const stores = await seedStores();

    // 4. Seed 70 Products across 5 categories
    const products = await seedProducts();

    // 5. Seed Product Lifecycle & Predecessor/Successor Cannibalisation
    const lifecycles = await seedLifecycle(products);

    // 6. Seed 12 Months of Sales & Stockouts (with realistic festive surges)
    await seedSales(stores, products, lifecycles);

    // 7. Seed Central Warehouse & Store Inventories (Strictly bounded by ₹4 Cr Budget)
    await seedInventory(stores, products);

    // 8. Explicit Budget Ceiling Audit & Verification
    const invStats = await Inventory.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('inventory_value')), 'total_val'],
        [sequelize.fn('SUM', sequelize.col('current_quantity')), 'total_qty']
      ],
      raw: true
    });
    const totalChainValue = parseFloat(invStats[0].total_val || 0);
    const totalChainUnits = parseInt(invStats[0].total_qty || 0, 10);
    const budgetCeiling = 40000000; // ₹4.00 Crore

    console.log('---------------------------------------------------------------');
    console.log(`[Budget Audit] Total Chain Inventory: ₹${(totalChainValue / 10000000).toFixed(2)} Cr (${totalChainUnits} units)`);
    console.log(`[Budget Audit] Budget Ceiling:         ₹${(budgetCeiling / 10000000).toFixed(2)} Cr`);
    console.log(`[Budget Audit] Capital Utilization:    ${((totalChainValue / budgetCeiling) * 100).toFixed(1)}%`);
    console.log(`[Budget Audit] Headroom Remaining:     ₹${((budgetCeiling - totalChainValue) / 100000).toFixed(2)} Lakhs`);
    console.log(`[Budget Audit] Budget Status:          ${totalChainValue <= budgetCeiling ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log('---------------------------------------------------------------');

    if (totalChainValue > budgetCeiling) {
      throw new Error(`CRITICAL BUDGET VIOLATION: Seeded chain inventory value (₹${totalChainValue}) exceeds ₹4.00 Cr budget ceiling!`);
    }

    // 9. Run EOL Risk Engine Evaluation (HOLD vs TRANSFER vs MARKDOWN)
    console.log('[Seed] Evaluating initial EOL Risks...');
    await evaluateEolRisks();

    // 10. Generate Initial Monday Weekly Allocation Plan
    console.log('[Seed] Generating initial Weekly Allocation...');
    await generateWeeklyAllocation();

    // 11. Run Baseline Proportional Algorithm & Benchmark Simulation (5 KPIs)
    console.log('[Seed] Running Naive Baseline Benchmark simulation...');
    await runBaselineSimulationAndComparison();

    // 12. Run Initial Live Defense Scenario Simulation Snapshot
    console.log('[Seed] Initializing Live Defense Scenario snapshot...');
    await simulateDisruptionScenario();

    console.log('===============================================================');
    console.log('       DATABASE SEEDING COMPLETED SUCCESSFULLY!                ');
    console.log('===============================================================');
    console.log(' Summary of Seeded Entities:');
    console.log(` - Stores: 25 (8 Bangalore + 17 Tier-2/3 Karnataka Towns)`);
    console.log(` - Mobile Models: 70 Products (Apple, Samsung, OnePlus, Xiaomi, Realme, Vivo, Oppo, Moto, Nothing, Nokia)`);
    console.log(` - Historical Sales: 12 Months (52 Weeks x 25 Stores x 70 Phones)`);
    console.log(` - Inventory: Central Warehouse + 25 Stores (Bounded within ₹4.00 Cr Budget)`);
    console.log(` - Core Algorithms: Store Profiling, EOL Risk Optimizer, Weekly Allocation Engine, Naive Baseline Benchmark, Scenario Simulator`);
    console.log('===============================================================');
  } catch (error) {
    console.error(' [Seed Error] Seeding process failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeed().then(() => {
    process.exit(0);
  });
}

module.exports = { runSeed };
