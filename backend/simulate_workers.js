// Using native fetch

const API_URL = 'http://127.0.0.1:3001/api';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASS = 'password123';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function simulate() {
  console.log('🤖 Starting Realtime Workforce Simulator...');

  // 1. Log in as admin
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  
  if (!loginRes.ok) {
    console.error('Failed to login as admin. Make sure the backend is running!');
    return;
  }
  
  const { token: adminToken } = await loginRes.json();
  console.log('✅ Admin authenticated.');

  // 2. Create 3 fake workers
  const workersToCreate = [
    { firstName: 'Cyber', lastName: 'Punk', email: `cyber${Date.now()}@test.com`, role: 'Worker' },
    { firstName: 'Neon', lastName: 'Rider', email: `neon${Date.now()}@test.com`, role: 'Worker' },
    { firstName: 'Synth', lastName: 'Wave', email: `synth${Date.now()}@test.com`, role: 'Worker' },
  ];

  const activeWorkers = [];

  for (const w of workersToCreate) {
    const createRes = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(w)
    });

    const data = await createRes.json();
    console.log(`👤 Created Employee: ${w.firstName} ${w.lastName} (Password: ${data.initialPassword})`);
    
    // 3. Log in as the new worker
    const workerLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: w.email, password: data.initialPassword })
    });

    const workerAuth = await workerLoginRes.json();

    // 4. Clock them in
    await fetch(`${API_URL}/attendance/clock-in`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${workerAuth.token}` }
    });
    console.log(`⏱️  ${w.firstName} Clocked in.`);

    activeWorkers.push({ name: w.firstName, token: workerAuth.token });
  }

  console.log('\n🚀 Starting Realtime Work Simulation! Watch your Admin Web Dashboard...\n');

  // 5. Infinite loop: randomly select a worker and have them log items every 2-5 seconds
  while (true) {
    const randomWorker = activeWorkers[Math.floor(Math.random() * activeWorkers.length)];
    const itemsProcessed = Math.floor(Math.random() * 20) + 5; // 5 to 25 items

    try {
      const res = await fetch(`${API_URL}/performance/log`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${randomWorker.token}` 
        },
        body: JSON.stringify({ itemsProcessed })
      });
      if (res.ok) {
        console.log(`📦 ${randomWorker.name} processed ${itemsProcessed} items.`);
      }
    } catch (err) {
      // Ignore network errors like "SocketError: other side closed" due to keep-alive race conditions
      console.log(`⚠️ ${randomWorker.name} failed to log items (network hiccup), retrying later...`);
    }
    
    // Wait random time between 2 and 5 seconds
    const waitTime = Math.floor(Math.random() * 3000) + 2000;
    await sleep(waitTime);
  }
}

simulate();
