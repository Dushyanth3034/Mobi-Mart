const CONSTANTS = {
  // Chain-wide inventory budget: ₹4 Crore
  CHAIN_INVENTORY_BUDGET: 40000000,

  // Store count & details
  STORE_COUNT: 25,
  BANGALORE_STORE_COUNT: 8,

  // Product categories
  CATEGORIES: {
    KEYPAD_BUDGET: 'Keypad/Budget',
    BUDGET: 'Budget',
    MID_RANGE: 'Mid-range',
    PREMIUM: 'Premium',
    FLAGSHIP: 'Flagship'
  },

  // Category price ranges (in INR)
  PRICE_RANGES: {
    'Keypad/Budget': { min: 6000, max: 10000 },
    'Budget': { min: 10000, max: 20000 },
    'Mid-range': { min: 20000, max: 45000 },
    'Premium': { min: 45000, max: 80000 },
    'Flagship': { min: 80000, max: 150000 }
  },

  // Lifecycle stages
  LIFECYCLE_STAGES: {
    NEW: 'NEW',
    GROWING: 'GROWING',
    PEAK: 'PEAK',
    MATURE: 'MATURE',
    DECLINING: 'DECLINING',
    EOL_RISK: 'EOL_RISK',
    EOL: 'EOL'
  },

  // EOL Risk Tiers
  RISK_TIERS: {
    LOW: { min: 0, max: 30, label: 'Low', color: 'green' },
    MEDIUM: { min: 31, max: 60, label: 'Medium', color: 'yellow' },
    HIGH: { min: 61, max: 80, label: 'High', color: 'orange' },
    CRITICAL: { min: 81, max: 100, label: 'Critical', color: 'red' }
  },

  // Stockout severity by category
  // (Customer loss probability, wait-tolerance, margin loss multiplier)
  STOCKOUT_SEVERITY: {
    'Keypad/Budget': {
      customerLossProb: 0.85, // 85% walk away to competitor
      waitToleranceDays: 0,
      severityWeight: 1.3,
      label: 'High Churn Risk'
    },
    'Budget': {
      customerLossProb: 0.70,
      waitToleranceDays: 1,
      severityWeight: 1.2,
      label: 'Moderate-High Risk'
    },
    'Mid-range': {
      customerLossProb: 0.50,
      waitToleranceDays: 2,
      severityWeight: 1.0,
      label: 'Moderate Risk'
    },
    'Premium': {
      customerLossProb: 0.35,
      waitToleranceDays: 3,
      severityWeight: 0.85,
      label: 'Brand Loyal / Low Walkaway'
    },
    'Flagship': {
      customerLossProb: 0.25, // Enthusiasts willing to wait for inter-store transfer
      waitToleranceDays: 4,
      severityWeight: 0.70,
      label: 'High Wait Tolerance'
    }
  },

  // Inter-store transfer parameters
  TRANSFER: {
    MIN_COST_PER_UNIT: 300,
    MAX_COST_PER_UNIT: 800,
    INTRA_CITY_COST: 350,   // Bangalore to Bangalore
    INTER_CITY_COST: 650,   // Bangalore to Mysore/Hubli/etc.
    REMOTE_TIER3_COST: 780, // Bidar, Bijapur, etc.
    DELIVERY_DAYS: 2
  },

  // Markdown parameters (15% to 30%)
  MARKDOWN: {
    MIN_PERCENTAGE: 15,
    MAX_PERCENTAGE: 30,
    DEFAULT_EOL_PERCENTAGE: 20
  },

  // Carrying cost per month (% of inventory value)
  MONTHLY_HOLDING_COST_RATE: 0.02
};

module.exports = CONSTANTS;
