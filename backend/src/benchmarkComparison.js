const http = require('http');
const app = require('./app');

let server;

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const options = {
      hostname: '127.0.0.1',
      port: 5097,
      path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const duration = performance.now() - start;
        resolve({ status: res.statusCode, duration, size: Buffer.byteLength(data) });
      });
    });

    req.on('error', err => reject(err));
    req.end();
  });
}

async function runBenchmark() {
  server = app.listen(5097, async () => {
    console.log('========================================================================');
    console.log('            MOBIMART FULL-STACK PERFORMANCE BENCHMARK                   ');
    console.log('========================================================================');

    const endpoints = [
      { name: 'Executive Dashboard', path: '/api/dashboard/summary', before: '178 ms' },
      { name: 'Stores Directory', path: '/api/stores', before: '175 ms' },
      { name: 'Products Catalog', path: '/api/products', before: '228 ms' },
      { name: 'Inventory Management', path: '/api/inventory', before: '392 ms (3.04 MB)' },
      { name: 'Weekly Allocation', path: '/api/allocation/latest', before: '36 ms' },
      { name: 'EOL Risk Matrix', path: '/api/eol-risk', before: '25 ms' },
      { name: 'Baseline Benchmark', path: '/api/baseline/compare', before: '36 ms' },
      { name: 'Chain Analytics', path: '/api/analytics', before: '1,365 ms' }
    ];

    console.log(
      'Section'.padEnd(24) +
      'Endpoint'.padEnd(26) +
      'Before'.padEnd(16) +
      'Optimized Latency'.padEnd(20) +
      'Payload Size'
    );
    console.log('-'.repeat(95));

    for (const ep of endpoints) {
      try {
        // Run 2 passes to measure stable throughput
        await makeRequest(ep.path);
        const res = await makeRequest(ep.path);
        console.log(
          ep.name.padEnd(24) +
          ep.path.padEnd(26) +
          ep.before.padEnd(16) +
          `${res.duration.toFixed(1)} ms`.padEnd(20) +
          `${(res.size / 1024).toFixed(1)} KB`
        );
      } catch (err) {
        console.error(`Failed on ${ep.path}:`, err.message);
      }
    }

    console.log('========================================================================');
    server.close();
    process.exit(0);
  });
}

runBenchmark();
