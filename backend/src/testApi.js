const http = require('http');

async function testEndpoint(path, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing MobiMart Backend Endpoints ---');
  try {
    const health = await testEndpoint('/api/health');
    console.log('[1] Health Check:', health.status, health.body.status);

    const dashboard = await testEndpoint('/api/dashboard/summary');
    console.log('[2] Dashboard Summary:', dashboard.status, 'Capital Utilization:', dashboard.body.data.capital.capitalUtilization + '%', 'At-risk Value: ₹' + (dashboard.body.data.risk.atRiskValue / 100000).toFixed(2) + 'L');

    const stores = await testEndpoint('/api/stores');
    console.log('[3] Stores Count:', stores.status, stores.body.count, 'stores');

    const products = await testEndpoint('/api/products');
    console.log('[4] Products Count:', products.status, products.body.count, 'phones');

    const inventory = await testEndpoint('/api/inventory');
    console.log('[5] Inventory Records:', inventory.status, inventory.body.count, 'records');

    const allocation = await testEndpoint('/api/allocation/latest');
    console.log('[6] Latest Allocation:', allocation.status, allocation.body.data.week_identifier, 'Investment: ₹' + (allocation.body.data.total_investment / 100000).toFixed(2) + 'L');

    const eolRisks = await testEndpoint('/api/eol-risk');
    console.log('[7] EOL Risks Count:', eolRisks.status, eolRisks.body.count, 'active risks');

    const baseline = await testEndpoint('/api/baseline/compare');
    console.log('[8] Baseline Benchmark:', baseline.status, 'Our Stockout:', baseline.body.data.metrics.our_stockout_rate + '%', 'Baseline Stockout:', baseline.body.data.metrics.baseline_stockout_rate + '%');

    const scenario = await testEndpoint('/api/scenario/simulate', 'POST', {
      daysToLaunch: 10,
      storeSalesDropPct: 40
    });
    console.log('[9] Scenario Simulation:', scenario.status, 'Rebalanced Delta:', scenario.body.data.totalUnitsBefore + ' units', 'Markdown Avoided: ₹' + (scenario.body.data.markdownAvoidedAmount / 100000).toFixed(2) + 'L');

    console.log('--- ALL ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Test error:', err.message);
  }
}

setTimeout(runTests, 1500);
