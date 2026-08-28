const { Product, ProductLifecycle } = require('../models');

const seedLifecycle = async (products) => {
  console.log('[Seed] Setting up Product Lifecycle & Successor relationships...');
  const skuMap = {};
  products.forEach(p => {
    skuMap[p.sku] = p.id;
  });

  const lifecycleData = [
    // Apple
    {
      sku: 'APL-IP15PM-256',
      stage: 'PEAK',
      launch_date: '2023-09-22',
      successor_sku: null,
      successor_name: 'iPhone 16 Pro Max',
      expected_successor_date: '2026-09-20',
      rumoured_successor_date: '2026-09-15',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.65,
      lifecycle_demand_multiplier: 1.15,
      eol_risk_score: 35.0,
      risk_reason: 'Rumoured successor in ~25 days. Moderate pre-announcement hesitation.'
    },
    {
      sku: 'APL-IP15P-128',
      stage: 'PEAK',
      launch_date: '2023-09-22',
      successor_sku: null,
      successor_name: 'iPhone 16 Pro',
      expected_successor_date: '2026-09-20',
      rumoured_successor_date: '2026-09-15',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.65,
      lifecycle_demand_multiplier: 1.10,
      eol_risk_score: 32.0,
      risk_reason: 'Rumoured successor in ~25 days.'
    },
    {
      sku: 'APL-IP15PLS-128',
      stage: 'PEAK',
      launch_date: '2023-09-22',
      successor_sku: null,
      successor_name: 'iPhone 16 Plus',
      expected_successor_date: '2026-09-20',
      rumoured_successor_date: '2026-09-15',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.60,
      lifecycle_demand_multiplier: 1.05,
      eol_risk_score: 28.0,
      risk_reason: 'Stable seasonal flagship sales.'
    },
    {
      sku: 'APL-IP15-128',
      stage: 'PEAK',
      launch_date: '2023-09-22',
      successor_sku: null,
      successor_name: 'iPhone 16',
      expected_successor_date: '2026-09-20',
      rumoured_successor_date: '2026-09-15',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.60,
      lifecycle_demand_multiplier: 1.20,
      eol_risk_score: 25.0,
      risk_reason: 'Strongest premium volume driver.'
    },
    {
      sku: 'APL-IP14PLS-128',
      stage: 'DECLINING',
      launch_date: '2022-10-07',
      successor_sku: 'APL-IP15PLS-128',
      successor_name: 'iPhone 15 Plus 128GB',
      expected_successor_date: '2023-09-22',
      rumoured_successor_date: null,
      confirmed_successor_date: '2023-09-12',
      cannibalisation_rate: 0.70,
      lifecycle_demand_multiplier: 0.75,
      eol_risk_score: 68.0,
      risk_reason: 'Successor active; sales cannibalised by 55%.'
    },
    {
      sku: 'APL-IP14-128',
      stage: 'MATURE',
      launch_date: '2022-09-16',
      successor_sku: 'APL-IP15-128',
      successor_name: 'iPhone 15 128GB',
      expected_successor_date: '2023-09-22',
      rumoured_successor_date: null,
      confirmed_successor_date: '2023-09-12',
      cannibalisation_rate: 0.50,
      lifecycle_demand_multiplier: 0.90,
      eol_risk_score: 45.0,
      risk_reason: 'Secondary volume driver with price markdown support.'
    },
    {
      sku: 'APL-IP13-128',
      stage: 'DECLINING',
      launch_date: '2021-09-24',
      successor_sku: 'APL-IP14-128',
      successor_name: 'iPhone 14 128GB',
      expected_successor_date: '2022-09-16',
      rumoured_successor_date: null,
      confirmed_successor_date: '2022-09-07',
      cannibalisation_rate: 0.65,
      lifecycle_demand_multiplier: 0.65,
      eol_risk_score: 72.0,
      risk_reason: 'Two generations old; demand shifting to iPhone 14/15.'
    },
    {
      sku: 'APL-IP12-64',
      stage: 'EOL_RISK',
      launch_date: '2020-10-23',
      successor_sku: 'APL-IP13-128',
      successor_name: 'iPhone 13 128GB',
      expected_successor_date: '2021-09-24',
      rumoured_successor_date: null,
      confirmed_successor_date: '2021-09-14',
      cannibalisation_rate: 0.85,
      lifecycle_demand_multiplier: 0.35,
      eol_risk_score: 88.0,
      risk_reason: 'Official production phase-out. Critical inventory liquidation needed.'
    },

    // Samsung
    {
      sku: 'SAM-S24U-256',
      stage: 'PEAK',
      launch_date: '2024-01-24',
      successor_sku: null,
      successor_name: 'Galaxy S25 Ultra',
      expected_successor_date: '2027-01-15',
      rumoured_successor_date: '2027-01-10',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.65,
      lifecycle_demand_multiplier: 1.25,
      eol_risk_score: 18.0,
      risk_reason: 'Flagship bestseller; 5+ months before next Galaxy Unpacked.'
    },
    {
      sku: 'SAM-S24P-256',
      stage: 'PEAK',
      launch_date: '2024-01-24',
      successor_sku: null,
      successor_name: 'Galaxy S25 Plus',
      expected_successor_date: '2027-01-15',
      rumoured_successor_date: '2027-01-10',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.60,
      lifecycle_demand_multiplier: 1.10,
      eol_risk_score: 22.0,
      risk_reason: 'Strong performance in Bangalore premium catchments.'
    },
    {
      sku: 'SAM-S24-128',
      stage: 'PEAK',
      launch_date: '2024-01-24',
      successor_sku: null,
      successor_name: 'Galaxy S25',
      expected_successor_date: '2027-01-15',
      rumoured_successor_date: '2027-01-10',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.60,
      lifecycle_demand_multiplier: 1.15,
      eol_risk_score: 20.0,
      risk_reason: 'High steady velocity in Tier-1 & Tier-2 stores.'
    },
    {
      sku: 'SAM-S23U-256',
      stage: 'DECLINING',
      launch_date: '2023-02-01',
      successor_sku: 'SAM-S24U-256',
      successor_name: 'Galaxy S24 Ultra 5G 256GB',
      expected_successor_date: '2024-01-24',
      rumoured_successor_date: null,
      confirmed_successor_date: '2024-01-17',
      cannibalisation_rate: 0.75,
      lifecycle_demand_multiplier: 0.55,
      eol_risk_score: 76.0,
      risk_reason: 'Heavy cannibalisation by S24 Ultra; high unit cost holding risk.'
    },
    {
      sku: 'SAM-S23FE-128',
      stage: 'MATURE',
      launch_date: '2023-10-04',
      successor_sku: null,
      successor_name: 'Galaxy S24 FE',
      expected_successor_date: '2026-10-10',
      rumoured_successor_date: '2026-09-25',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.60,
      lifecycle_demand_multiplier: 0.95,
      eol_risk_score: 38.0,
      risk_reason: 'Rumoured FE refresh in 4-6 weeks.'
    },
    {
      sku: 'SAM-S23-128',
      stage: 'EOL_RISK',
      launch_date: '2023-02-01',
      successor_sku: 'SAM-S24-128',
      successor_name: 'Galaxy S24 5G 128GB',
      expected_successor_date: '2024-01-24',
      rumoured_successor_date: null,
      confirmed_successor_date: '2024-01-17',
      cannibalisation_rate: 0.70,
      lifecycle_demand_multiplier: 0.45,
      eol_risk_score: 82.0,
      risk_reason: 'S24 firmly established; customer demand transferred.'
    },
    {
      sku: 'SAM-ZFOLD5-256',
      stage: 'MATURE',
      launch_date: '2023-08-11',
      successor_sku: null,
      successor_name: 'Galaxy Z Fold 6',
      expected_successor_date: '2026-09-05',
      rumoured_successor_date: '2026-08-25',
      confirmed_successor_date: '2026-09-01',
      cannibalisation_rate: 0.80,
      lifecycle_demand_multiplier: 0.65,
      eol_risk_score: 78.0,
      risk_reason: 'Confirmed Fold 6 launch imminent! High capital exposure.'
    },
    {
      sku: 'SAM-ZFLIP5-256',
      stage: 'MATURE',
      launch_date: '2023-08-11',
      successor_sku: null,
      successor_name: 'Galaxy Z Flip 6',
      expected_successor_date: '2026-09-05',
      rumoured_successor_date: '2026-08-25',
      confirmed_successor_date: '2026-09-01',
      cannibalisation_rate: 0.80,
      lifecycle_demand_multiplier: 0.70,
      eol_risk_score: 75.0,
      risk_reason: 'Confirmed Flip 6 launch imminent.'
    },
    {
      sku: 'SAM-A55-128',
      stage: 'GROWING',
      launch_date: '2024-03-15',
      successor_sku: null,
      successor_name: 'Galaxy A56 5G',
      expected_successor_date: '2027-03-15',
      rumoured_successor_date: null,
      confirmed_successor_date: null,
      cannibalisation_rate: 0.50,
      lifecycle_demand_multiplier: 1.15,
      eol_risk_score: 12.0,
      risk_reason: 'Fresh launch; upward demand trajectory across Karnataka.'
    },
    {
      sku: 'SAM-A35-128',
      stage: 'GROWING',
      launch_date: '2024-03-15',
      successor_sku: null,
      successor_name: 'Galaxy A36 5G',
      expected_successor_date: '2027-03-15',
      rumoured_successor_date: null,
      confirmed_successor_date: null,
      cannibalisation_rate: 0.50,
      lifecycle_demand_multiplier: 1.12,
      eol_risk_score: 14.0,
      risk_reason: 'Solid mid-range growth.'
    },
    {
      sku: 'SAM-A25-128',
      stage: 'MATURE',
      launch_date: '2024-01-01',
      successor_sku: null,
      successor_name: 'Galaxy A26 5G',
      expected_successor_date: '2027-01-10',
      rumoured_successor_date: null,
      confirmed_successor_date: null,
      cannibalisation_rate: 0.50,
      lifecycle_demand_multiplier: 0.95,
      eol_risk_score: 26.0,
      risk_reason: 'Consistent volume in Tier-2/3.'
    },
    {
      sku: 'SAM-A15-128',
      stage: 'PEAK',
      launch_date: '2024-01-01',
      successor_sku: null,
      successor_name: 'Galaxy A16 5G',
      expected_successor_date: '2026-11-20',
      rumoured_successor_date: '2026-10-15',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.55,
      lifecycle_demand_multiplier: 1.20,
      eol_risk_score: 30.0,
      risk_reason: 'Top-selling 5G budget smartphone.'
    },
    {
      sku: 'SAM-M34-128',
      stage: 'DECLINING',
      launch_date: '2023-07-07',
      successor_sku: 'SAM-A15-128',
      successor_name: 'Galaxy A15 5G 128GB',
      expected_successor_date: '2024-01-01',
      rumoured_successor_date: null,
      confirmed_successor_date: '2023-12-20',
      cannibalisation_rate: 0.65,
      lifecycle_demand_multiplier: 0.60,
      eol_risk_score: 70.0,
      risk_reason: 'Older M-series replaced by A15/M35.'
    },
    {
      sku: 'SAM-M14-128',
      stage: 'DECLINING',
      launch_date: '2023-04-17',
      successor_sku: 'SAM-F14-128',
      successor_name: 'Galaxy F14 5G 128GB',
      expected_successor_date: '2023-06-01',
      rumoured_successor_date: null,
      confirmed_successor_date: null,
      cannibalisation_rate: 0.60,
      lifecycle_demand_multiplier: 0.65,
      eol_risk_score: 66.0,
      risk_reason: 'Declining budget volume.'
    },
    {
      sku: 'SAM-F14-128',
      stage: 'MATURE',
      launch_date: '2023-06-01',
      successor_sku: null,
      successor_name: 'Galaxy F15 5G',
      expected_successor_date: '2026-09-30',
      rumoured_successor_date: '2026-09-10',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.60,
      lifecycle_demand_multiplier: 0.88,
      eol_risk_score: 42.0,
      risk_reason: 'Rumoured F15 refresh in Tier-3 centers.'
    },

    // OnePlus
    {
      sku: 'OP-12-256',
      stage: 'PEAK',
      launch_date: '2024-01-23',
      successor_sku: null,
      successor_name: 'OnePlus 13',
      expected_successor_date: '2027-01-15',
      rumoured_successor_date: '2026-11-20',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.65,
      lifecycle_demand_multiplier: 1.20,
      eol_risk_score: 22.0,
      risk_reason: 'Dominant flagship performer.'
    },
    {
      sku: 'OP-12R-256',
      stage: 'GROWING',
      launch_date: '2024-01-23',
      successor_sku: null,
      successor_name: 'OnePlus 13R',
      expected_successor_date: '2027-01-15',
      rumoured_successor_date: null,
      confirmed_successor_date: null,
      cannibalisation_rate: 0.60,
      lifecycle_demand_multiplier: 1.25,
      eol_risk_score: 16.0,
      risk_reason: 'Massive demand across tech youth.'
    },
    {
      sku: 'OP-11-256',
      stage: 'DECLINING',
      launch_date: '2023-02-07',
      successor_sku: 'OP-12-256',
      successor_name: 'OnePlus 12 5G 256GB',
      expected_successor_date: '2024-01-23',
      rumoured_successor_date: null,
      confirmed_successor_date: '2024-01-04',
      cannibalisation_rate: 0.80,
      lifecycle_demand_multiplier: 0.45,
      eol_risk_score: 79.0,
      risk_reason: 'OnePlus 12 captured 75% of OP-11 customer base.'
    },
    {
      sku: 'OP-11R-128',
      stage: 'EOL_RISK',
      launch_date: '2023-02-07',
      successor_sku: 'OP-12R-256',
      successor_name: 'OnePlus 12R 5G 256GB',
      expected_successor_date: '2024-01-23',
      rumoured_successor_date: null,
      confirmed_successor_date: '2024-01-04',
      cannibalisation_rate: 0.82,
      lifecycle_demand_multiplier: 0.40,
      eol_risk_score: 84.0,
      risk_reason: 'Direct predecessor to 12R; liquidation urgency.'
    },
    {
      sku: 'OP-NORD4-256',
      stage: 'NEW',
      launch_date: '2024-07-16',
      successor_sku: null,
      successor_name: 'OnePlus Nord 5',
      expected_successor_date: '2027-07-16',
      rumoured_successor_date: null,
      confirmed_successor_date: null,
      cannibalisation_rate: 0.50,
      lifecycle_demand_multiplier: 1.30,
      eol_risk_score: 5.0,
      risk_reason: 'Brand new metal unibody launch with huge organic pull.'
    },
    {
      sku: 'OP-NORDCE4-128',
      stage: 'GROWING',
      launch_date: '2024-04-01',
      successor_sku: null,
      successor_name: 'OnePlus Nord CE5',
      expected_successor_date: '2027-04-01',
      rumoured_successor_date: null,
      confirmed_successor_date: null,
      cannibalisation_rate: 0.50,
      lifecycle_demand_multiplier: 1.22,
      eol_risk_score: 10.0,
      risk_reason: 'Top mid-range performer in tier-2 cities.'
    },
    {
      sku: 'OP-NORDCE4L-128',
      stage: 'NEW',
      launch_date: '2024-06-24',
      successor_sku: null,
      successor_name: 'OnePlus Nord CE5 Lite',
      expected_successor_date: '2027-06-24',
      rumoured_successor_date: null,
      confirmed_successor_date: null,
      cannibalisation_rate: 0.50,
      lifecycle_demand_multiplier: 1.18,
      eol_risk_score: 8.0,
      risk_reason: 'Newly launched sub-20k segment leader.'
    },
    {
      sku: 'OP-NORDCE3L-128',
      stage: 'DECLINING',
      launch_date: '2023-04-04',
      successor_sku: 'OP-NORDCE4L-128',
      successor_name: 'OnePlus Nord CE4 Lite 128GB',
      expected_successor_date: '2024-06-24',
      rumoured_successor_date: null,
      confirmed_successor_date: '2024-06-18',
      cannibalisation_rate: 0.75,
      lifecycle_demand_multiplier: 0.50,
      eol_risk_score: 74.0,
      risk_reason: 'CE4 Lite cannibalising remaining sales.'
    },

    // Xiaomi & Redmi
    {
      sku: 'MI-14U-512',
      stage: 'GROWING',
      launch_date: '2024-03-07',
      successor_sku: null,
      successor_name: 'Xiaomi 15 Ultra',
      expected_successor_date: '2027-03-10',
      rumoured_successor_date: null,
      confirmed_successor_date: null,
      cannibalisation_rate: 0.60,
      lifecycle_demand_multiplier: 1.10,
      eol_risk_score: 18.0,
      risk_reason: 'Photography flagship niche appeal.'
    },
    {
      sku: 'MI-14-512',
      stage: 'PEAK',
      launch_date: '2024-03-07',
      successor_sku: null,
      successor_name: 'Xiaomi 15',
      expected_successor_date: '2026-11-15',
      rumoured_successor_date: '2026-10-10',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.60,
      lifecycle_demand_multiplier: 1.15,
      eol_risk_score: 28.0,
      risk_reason: 'Compact flagship velocity steady.'
    },
    {
      sku: 'MI-13P-256',
      stage: 'EOL_RISK',
      launch_date: '2023-02-26',
      successor_sku: 'MI-14-512',
      successor_name: 'Xiaomi 14 5G 512GB',
      expected_successor_date: '2024-03-07',
      rumoured_successor_date: null,
      confirmed_successor_date: '2024-02-25',
      cannibalisation_rate: 0.85,
      lifecycle_demand_multiplier: 0.30,
      eol_risk_score: 89.0,
      risk_reason: 'Superseded by Xiaomi 14 series; immediate markdown candidate.'
    },
    {
      sku: 'RED-N13PP-256',
      stage: 'PEAK',
      launch_date: '2024-01-04',
      successor_sku: null,
      successor_name: 'Redmi Note 14 Pro+',
      expected_successor_date: '2026-12-10',
      rumoured_successor_date: '2026-10-25',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.65,
      lifecycle_demand_multiplier: 1.25,
      eol_risk_score: 24.0,
      risk_reason: 'Strong mid-range flagship with IP68.'
    },
    {
      sku: 'RED-N13P-128',
      stage: 'PEAK',
      launch_date: '2024-01-04',
      successor_sku: null,
      successor_name: 'Redmi Note 14 Pro',
      expected_successor_date: '2026-12-10',
      rumoured_successor_date: '2026-10-25',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.60,
      lifecycle_demand_multiplier: 1.22,
      eol_risk_score: 22.0,
      risk_reason: 'High volume seller.'
    },
    {
      sku: 'RED-N13-128',
      stage: 'PEAK',
      launch_date: '2024-01-04',
      successor_sku: null,
      successor_name: 'Redmi Note 14 5G',
      expected_successor_date: '2026-12-10',
      rumoured_successor_date: '2026-10-25',
      confirmed_successor_date: null,
      cannibalisation_rate: 0.60,
      lifecycle_demand_multiplier: 1.30,
      eol_risk_score: 20.0,
      risk_reason: 'Highest budget unit velocity in Karnataka.'
    },
    {
      sku: 'RED-N12P-128',
      stage: 'EOL',
      launch_date: '2023-01-05',
      successor_sku: 'RED-N13P-128',
      successor_name: 'Redmi Note 13 Pro 5G 128GB',
      expected_successor_date: '2024-01-04',
      rumoured_successor_date: null,
      confirmed_successor_date: '2023-12-28',
      cannibalisation_rate: 0.90,
      lifecycle_demand_multiplier: 0.20,
      eol_risk_score: 95.0,
      risk_reason: 'Obsolete inventory; 25%+ clearance markdown mandatory.'
    },
    {
      sku: 'RED-13C-128',
      stage: 'GROWING',
      launch_date: '2023-12-06',
      successor_sku: null,
      successor_name: 'Redmi 14C 5G',
      expected_successor_date: '2026-12-06',
      rumoured_successor_date: null,
      confirmed_successor_date: null,
      cannibalisation_rate: 0.50,
      lifecycle_demand_multiplier: 1.25,
      eol_risk_score: 10.0,
      risk_reason: 'Affordable 5G leader in Tier-3 towns.'
    },
    {
      sku: 'RED-12-128',
      stage: 'MATURE',
      launch_date: '2023-08-01',
      successor_sku: 'RED-13C-128',
      successor_name: 'Redmi 13C 5G 128GB',
      expected_successor_date: '2023-12-06',
      rumoured_successor_date: null,
      confirmed_successor_date: '2023-11-28',
      cannibalisation_rate: 0.55,
      lifecycle_demand_multiplier: 0.85,
      eol_risk_score: 48.0,
      risk_reason: 'Mature baseline budget phone.'
    },
    {
      sku: 'RED-A3-64',
      stage: 'PEAK',
      launch_date: '2024-02-14',
      successor_sku: null,
      successor_name: 'Redmi A4',
      expected_successor_date: '2027-02-14',
      rumoured_successor_date: null,
      confirmed_successor_date: null,
      cannibalisation_rate: 0.45,
      lifecycle_demand_multiplier: 1.20,
      eol_risk_score: 15.0,
      risk_reason: 'High volume entry-level smartphone under ₹7,000.'
    }
  ];

  // Also configure remaining products (Realme, Vivo, Oppo, Moto, Nothing, Nokia) with intelligent lifecycles
  const remainingProducts = products.filter(p => !lifecycleData.find(ld => ld.sku === p.sku));

  remainingProducts.forEach(p => {
    let stage = 'MATURE';
    let risk_score = 30.0;
    let multiplier = 1.0;
    let reason = 'Steady catalog product.';

    if (p.model_name.includes('X100') || p.model_name.includes('Reno 11') || p.model_name.includes('Edge 50') || p.model_name.includes('Phone (2a)')) {
      stage = 'PEAK';
      multiplier = 1.2;
      risk_score = 20.0;
      reason = 'High consumer interest and healthy stock turns.';
    } else if (p.model_name.includes('V29') || p.model_name.includes('G54') || p.model_name.includes('Edge 40')) {
      stage = 'DECLINING';
      multiplier = 0.65;
      risk_score = 65.0;
      reason = 'Older cycle product with newer generation models gaining share.';
    } else if (p.category === 'Keypad/Budget') {
      stage = 'MATURE';
      multiplier = 1.0;
      risk_score = 22.0;
      reason = 'Resilient, inelastic replacement demand in rural/Tier-3 centers.';
    }

    lifecycleData.push({
      sku: p.sku,
      stage,
      launch_date: '2024-01-15',
      successor_sku: null,
      successor_name: null,
      expected_successor_date: null,
      rumoured_successor_date: null,
      confirmed_successor_date: null,
      cannibalisation_rate: 0.50,
      lifecycle_demand_multiplier: multiplier,
      eol_risk_score: risk_score,
      risk_reason: reason
    });
  });

  const recordsToInsert = lifecycleData.map(ld => {
    const productId = skuMap[ld.sku];
    const successorId = ld.successor_sku ? skuMap[ld.successor_sku] : null;
    return {
      product_id: productId,
      stage: ld.stage,
      launch_date: ld.launch_date,
      successor_product_id: successorId,
      successor_name: ld.successor_name,
      expected_successor_date: ld.expected_successor_date,
      rumoured_successor_date: ld.rumoured_successor_date,
      confirmed_successor_date: ld.confirmed_successor_date,
      cannibalisation_rate: ld.cannibalisation_rate,
      lifecycle_demand_multiplier: ld.lifecycle_demand_multiplier,
      eol_risk_score: ld.eol_risk_score,
      risk_reason: ld.risk_reason
    };
  }).filter(r => r.product_id);

  await ProductLifecycle.bulkCreate(recordsToInsert, { updateOnDuplicate: Object.keys(recordsToInsert[0]) });
  console.log(`[Seed] Successfully seeded ${recordsToInsert.length} product lifecycles.`);
  return await ProductLifecycle.findAll();
};

module.exports = { seedLifecycle };
