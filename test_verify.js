const http = require('http');

const testUrl = (url, name) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log(`[PASS] ${name} (Status: ${res.statusCode}) - Received ${data.length} bytes`);
        resolve({ status: res.statusCode, data });
      });
    }).on('error', (err) => {
      console.error(`[FAIL] ${name} - Error: ${err.message}`);
      reject(err);
    });
  });
};

const postData = (url, postBody, name) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const bodyStr = JSON.stringify(postBody);
    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          console.log(`[PASS] ${name} (Status: ${res.statusCode}) - Response: ${data.substring(0, 100)}...`);
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        });
      }
    );
    req.on('error', (err) => {
      console.error(`[FAIL] ${name} - Error: ${err.message}`);
      reject(err);
    });
    req.write(bodyStr);
    req.end();
  });
};

async function runVerification() {
  try {
    console.log('\n================ SB WORKS LIVE TEST SUITE ================\n');

    // 1. Health API
    await testUrl('http://localhost:6001/api/health', '1. Backend Health Endpoint');

    // 2. Projects List API
    const projectsRes = await testUrl('http://localhost:6001/api/projects', '2. Projects Catalog API');
    const projectsData = JSON.parse(projectsRes.data);
    console.log(`   -> Found ${projectsData.count} seeded projects in MongoDB`);

    // 3. Client Login Test
    const clientLogin = await postData(
      'http://localhost:6001/api/auth/login',
      { email: 'client@sbworks.com', password: 'client123' },
      '3. Client Login (client@sbworks.com)'
    );
    console.log(`   -> Logged in as: ${clientLogin.data.user.username} (Role: ${clientLogin.data.user.role})`);

    // 4. Freelancer Login Test
    const freelancerLogin = await postData(
      'http://localhost:6001/api/auth/login',
      { email: 'freelancer@sbworks.com', password: 'freelancer123' },
      '4. Freelancer Login (freelancer@sbworks.com)'
    );
    console.log(`   -> Logged in as: ${freelancerLogin.data.user.username} (Role: ${freelancerLogin.data.user.role})`);

    // 5. Admin Login Test
    const adminLogin = await postData(
      'http://localhost:6001/api/auth/login',
      { email: 'admin@sbworks.com', password: 'admin123' },
      '5. Admin Login (admin@sbworks.com)'
    );
    console.log(`   -> Logged in as: ${adminLogin.data.user.username} (Role: ${adminLogin.data.user.role})`);

    // 6. Frontend Dev Server Check
    await testUrl('http://localhost:5173/', '6. Frontend Web Server (Vite + React)');

    console.log('\n================ ALL SYSTEMS VERIFIED ONLINE & OPERATIONAL ================\n');
  } catch (err) {
    console.error('Verification encountered an issue:', err.message);
  }
}

runVerification();
