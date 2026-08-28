import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Simple In-Memory Client-Side Cache with TTL (30 seconds)
const responseCache = new Map();
const CACHE_TTL_MS = 30000;

export function clearApiCache(prefix = '') {
  if (!prefix) {
    responseCache.clear();
  } else {
    for (const key of responseCache.keys()) {
      if (key.startsWith(prefix)) {
        responseCache.delete(key);
      }
    }
  }
}

async function cachedGet(url, params = {}, bypassCache = false) {
  const cacheKey = `${url}_${JSON.stringify(params || {})}`;
  const now = Date.now();

  if (!bypassCache && responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    responseCache.delete(cacheKey);
  }

  const response = await api.get(url, { params });
  responseCache.set(cacheKey, { timestamp: now, data: response });
  return response;
}

export const dashboardApi = {
  getSummary: (bypassCache = false) => cachedGet('/dashboard/summary', {}, bypassCache)
};

export const storesApi = {
  getAll: (bypassCache = false) => cachedGet('/stores', {}, bypassCache),
  getById: (id, bypassCache = false) => cachedGet(`/stores/${id}`, {}, bypassCache)
};

export const productsApi = {
  getAll: (bypassCache = false) => cachedGet('/products', {}, bypassCache),
  getById: (id, bypassCache = false) => cachedGet(`/products/${id}`, {}, bypassCache)
};

export const inventoryApi = {
  getInventory: (params, bypassCache = false) => cachedGet('/inventory', params, bypassCache),
  getWarehouseStock: (bypassCache = false) => cachedGet('/inventory/warehouse', {}, bypassCache),
  getDeadStock: (bypassCache = false) => cachedGet('/inventory/dead-stock', {}, bypassCache)
};

export const allocationApi = {
  getLatest: (bypassCache = false) => cachedGet('/allocation/latest', {}, bypassCache),
  getHistory: (bypassCache = false) => cachedGet('/allocation/history', {}, bypassCache),
  getById: (id, bypassCache = false) => cachedGet(`/allocation/${id}`, {}, bypassCache),
  generate: async (budget) => {
    clearApiCache('/allocation');
    clearApiCache('/dashboard');
    clearApiCache('/inventory');
    return api.post('/allocation/generate', { budget });
  }
};

export const eolRiskApi = {
  getRisks: (params, bypassCache = false) => cachedGet('/eol-risk', params, bypassCache),
  recalculate: async () => {
    clearApiCache('/eol-risk');
    clearApiCache('/dashboard');
    return api.post('/eol-risk/recalculate');
  },
  executeAction: async (id, action_type, params = {}) => {
    clearApiCache('/eol-risk');
    clearApiCache('/inventory');
    clearApiCache('/dashboard');
    return api.post(`/eol-risk/action/${id}`, { action_type, ...params });
  },
  getTransfers: (bypassCache = false) => cachedGet('/eol-risk/transfers', {}, bypassCache),
  getMarkdowns: (bypassCache = false) => cachedGet('/eol-risk/markdowns', {}, bypassCache)
};

export const baselineApi = {
  getComparison: (bypassCache = false) => cachedGet('/baseline/compare', {}, bypassCache),
  runSimulation: async () => {
    clearApiCache('/baseline');
    return api.post('/baseline/run');
  }
};

export const scenarioApi = {
  simulate: async (params) => {
    clearApiCache('/scenario');
    return api.post('/scenario/simulate', params);
  },
  getHistory: (bypassCache = false) => cachedGet('/scenario/history', {}, bypassCache)
};

export const analyticsApi = {
  getData: (bypassCache = false) => cachedGet('/analytics', {}, bypassCache)
};

export const seedApi = {
  reseed: async () => {
    clearApiCache();
    return api.post('/seed/run');
  }
};

export default api;
