const { sequelize } = require('./config/database');

async function applyIndexes() {
  console.log('[Database Optimization] Applying high-performance MySQL indexes...');

  const indexes = [
    // sales table (91,000 rows)
    { table: 'sales', name: 'idx_sales_product_id', columns: ['product_id'] },
    { table: 'sales', name: 'idx_sales_store_id', columns: ['store_id'] },
    { table: 'sales', name: 'idx_sales_year_month', columns: ['year', 'month'] },
    { table: 'sales', name: 'idx_sales_week_number', columns: ['week_number'] },
    { table: 'sales', name: 'idx_sales_is_festive', columns: ['is_festive_week'] },
    { table: 'sales', name: 'idx_sales_stockout', columns: ['stockout_occurred'] },

    // inventory table
    { table: 'inventory', name: 'idx_inventory_product_id', columns: ['product_id'] },
    { table: 'inventory', name: 'idx_inventory_store_id', columns: ['store_id'] },
    { table: 'inventory', name: 'idx_inventory_is_warehouse', columns: ['is_warehouse'] },
    { table: 'inventory', name: 'idx_inventory_is_dead_stock', columns: ['is_dead_stock'] },

    // products table
    { table: 'products', name: 'idx_products_category', columns: ['category'] },
    { table: 'products', name: 'idx_products_brand', columns: ['brand'] },

    // stores table
    { table: 'stores', name: 'idx_stores_tier', columns: ['tier'] },
    { table: 'stores', name: 'idx_stores_city', columns: ['city'] },

    // eol_risks table
    { table: 'eol_risks', name: 'idx_eol_product_id', columns: ['product_id'] },
    { table: 'eol_risks', name: 'idx_eol_store_id', columns: ['store_id'] },
    { table: 'eol_risks', name: 'idx_eol_risk_tier', columns: ['risk_tier'] },
    { table: 'eol_risks', name: 'idx_eol_action_executed', columns: ['action_executed'] },
    { table: 'eol_risks', name: 'idx_eol_recommended_action', columns: ['recommended_action'] }
  ];

  for (const idx of indexes) {
    try {
      const [existing] = await sequelize.query(`SHOW INDEX FROM \`${idx.table}\` WHERE Key_name = '${idx.name}'`);
      if (existing.length === 0) {
        const colList = idx.columns.map(c => `\`${c}\``).join(', ');
        await sequelize.query(`CREATE INDEX \`${idx.name}\` ON \`${idx.table}\` (${colList})`);
        console.log(` ✓ Created index ${idx.name} on ${idx.table}(${colList})`);
      } else {
        console.log(` - Index ${idx.name} already exists.`);
      }
    } catch (err) {
      console.warn(`Could not create index ${idx.name}:`, err.message);
    }
  }

  console.log('[Database Optimization] All high-performance indexes verified.');
}

if (require.main === module) {
  applyIndexes().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { applyIndexes };
