const http = require('http');
const app = require('./app');

let server;

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const options = {
      hostname: '127.0.0.1',
      port: 5098,
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
  server = app.listen(5098, async () => {
    console.log('--- MOBIMART API LATENCY BENCHMARK ---');
    const endpoints = [
      '/api/dashboard/summary',
      '/api/stores',
      '/api/products',
      '/api/inventory',
      '/api/allocation/latest',
      '/api/eol-risk',
      '/api/baseline/compare',
      '/api/analytics'
    ];

    console.log('Endpoint'.padEnd(30) + 'Status'.padEnd(10) + 'Latency (ms)'.padEnd(15) + 'Payload Size');
    console.log('-'.repeat(65));

    for (const ep of endpoints) {
      try {
        const res = await makeRequest(ep);
        console.log(
          ep.padEnd(30) +
          `${res.status}`.padEnd(10) +
          `${res.duration.toFixed(1)} ms`.padEnd(15) +
          `${(res.size / 1024).toFixed(1)} KB`
        );
      } catch (err) {
        console.error(`Failed on ${ep}:`, err.message);
      }
    }

    server.close();
    process.exit(0);
  });
}

runBenchmark();
