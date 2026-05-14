const http = require('http');

async function check() {
  const data = JSON.stringify({ idea: 'ping' });
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/enhance-idea',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => process.stdout.write(d));
  });

  req.on('error', (e) => console.error('❌ FAILED:', e.message));
  req.write(data);
  req.end();
}

check();
