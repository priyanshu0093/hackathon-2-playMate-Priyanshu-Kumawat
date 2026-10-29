process.env.TEST_MODE = 'true';
process.env.NODE_ENV = 'test';
import http from 'http';
import mongoose from 'mongoose';
import app from './server.js';

const PORT = 5097;

const request = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
};

const runRateLimitTest = async () => {
  console.log('--- Testing Brute Force Login Rate Limiter ---');
  const server = app.listen(PORT);
  await new Promise((r) => setTimeout(r, 1000));

  try {
    const testEmail = `bruteforce_${Date.now()}@test.io`;

    // Attempt 10 failed logins
    for (let i = 1; i <= 10; i++) {
      const res = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { email: testEmail, password: 'wrongpassword' }
      });
      console.log(`Attempt ${i}: status ${res.status}`);
    }

    // 11th attempt should be blocked with 429
    const blockedRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: testEmail, password: 'wrongpassword' }
    });

    console.log(`Attempt 11: status ${blockedRes.status}`, blockedRes.data);
    if (blockedRes.status === 429) {
      console.log('✅ PASS: Brute force login attempt was successfully rate limited (429)');
    } else {
      console.error('❌ FAIL: Expected 429 Too Many Requests');
      process.exit(1);
    }
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
};

runRateLimitTest();

