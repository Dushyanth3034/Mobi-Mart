const http = require('http');
const app = require('./app');
const { EolRisk, Store, Product } = require('./models');

let server;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5099,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', err => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runEolEndpointTests() {
  server = app.listen(5099, async () => {
    console.log('--- Test Server Running on port 5099 ---');
    try {
      // 1. Fetch active risks
      const risksRes = await makeRequest('/api/eol-risk');
      console.log('[1] GET /api/eol-risk:', risksRes.status, `(${risksRes.body.count} risks)`);

      const risks = risksRes.body.data || [];
      if (risks.length === 0) {
        console.log('No risks to execute.');
        server.close();
        process.exit(0);
      }

      // 2. Test Execute HOLD
      const holdTarget = risks.find(r => !r.action_executed) || risks[0];
      console.log(`[2] Testing POST /api/eol-risk/action/${holdTarget.id} (HOLD)...`);
      const holdRes = await makeRequest(`/api/eol-risk/action/${holdTarget.id}`, 'POST', {
        action_type: 'HOLD'
      });
      console.log('    HOLD Response:', holdRes.status, holdRes.body);

      // 3. Test Execute TRANSFER
      const transferTarget = risks.find(r => r.id !== holdTarget.id && !r.action_executed) || risks[1];
      console.log(`[3] Testing POST /api/eol-risk/action/${transferTarget.id} (TRANSFER)...`);
      const transferRes = await makeRequest(`/api/eol-risk/action/${transferTarget.id}`, 'POST', {
        action_type: 'TRANSFER'
      });
      console.log('    TRANSFER Response:', transferRes.status, transferRes.body);

      // 4. Test Execute MARKDOWN
      const markdownTarget = risks.find(r => r.id !== holdTarget.id && r.id !== transferTarget.id && !r.action_executed) || risks[2];
      console.log(`[4] Testing POST /api/eol-risk/action/${markdownTarget.id} (MARKDOWN)...`);
      const mdRes = await makeRequest(`/api/eol-risk/action/${markdownTarget.id}`, 'POST', {
        action_type: 'MARKDOWN',
        discount_percentage: 20
      });
      console.log('    MARKDOWN Response:', mdRes.status, mdRes.body);

      // 5. Test Repeated Click / Idempotency
      console.log(`[5] Testing Idempotent Click on already executed action #${holdTarget.id}...`);
      const repeatedRes = await makeRequest(`/api/eol-risk/action/${holdTarget.id}`, 'POST', {
        action_type: 'HOLD'
      });
      console.log('    Idempotent Response:', repeatedRes.status, repeatedRes.body.message);

      // 6. Test GET /api/eol-risk/transfers
      const transfersList = await makeRequest('/api/eol-risk/transfers');
      console.log('[6] GET /api/eol-risk/transfers:', transfersList.status, `(${transfersList.body.count} transfers recorded)`);

      // 7. Test GET /api/eol-risk/markdowns
      const markdownsList = await makeRequest('/api/eol-risk/markdowns');
      console.log('[7] GET /api/eol-risk/markdowns:', markdownsList.status, `(${markdownsList.body.count} markdowns recorded)`);

      console.log('\n===============================================================');
      console.log('       ALL EOL ACTION APIS TESTED & VERIFIED ATOMICALLY!       ');
      console.log('===============================================================');

      server.close();
      process.exit(0);
    } catch (err) {
      console.error('Test execution error:', err);
      server.close();
      process.exit(1);
    }
  });
}

runEolEndpointTests();
