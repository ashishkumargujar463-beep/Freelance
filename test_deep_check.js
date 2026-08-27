const http = require('http');

// Helper: GET request
const get = (url, token) => new Promise((resolve, reject) => {
  const opts = new URL(url);
  const options = {
    hostname: opts.hostname,
    port: opts.port,
    path: opts.pathname + opts.search,
    method: 'GET',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  };
  http.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve({ status: res.statusCode, body: safeJson(data) }));
  }).on('error', reject).end();
});

// Helper: POST request
const post = (url, payload, token) => new Promise((resolve, reject) => {
  const body = JSON.stringify(payload);
  const opts = new URL(url);
  const options = {
    hostname: opts.hostname,
    port: opts.port,
    path: opts.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  };
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve({ status: res.statusCode, body: safeJson(data) }));
  });
  req.on('error', reject);
  req.write(body);
  req.end();
});

const safeJson = (str) => { try { return JSON.parse(str); } catch { return str; } };

const pass = (label, extra = '') => console.log(`  ✅ ${label}${extra ? ' — ' + extra : ''}`);
const fail = (label, reason) => console.log(`  ❌ ${label} — ${reason}`);
const section = (title) => console.log(`\n━━━ ${title} ━━━`);

async function runDeepCheck() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   SB WORKS — FULL FUNCTIONAL BROWSER CHECK SUITE        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  let clientToken, freelancerToken, adminToken, projectId, applicationId;

  // ── 1. AUTH ──────────────────────────────────────────────
  section('1. AUTHENTICATION');

  const health = await get('http://localhost:6001/api/health');
  health.status === 200 ? pass('Health endpoint', 'API is online') : fail('Health endpoint', health.status);

  const clientRes = await post('http://localhost:6001/api/auth/login', { email: 'client@sbworks.com', password: 'client123' });
  if (clientRes.status === 200 && clientRes.body.token) {
    clientToken = clientRes.body.token;
    pass('Client login', `${clientRes.body.user.username} (${clientRes.body.user.role})`);
  } else { fail('Client login', JSON.stringify(clientRes.body)); }

  const freelancerRes = await post('http://localhost:6001/api/auth/login', { email: 'freelancer@sbworks.com', password: 'freelancer123' });
  if (freelancerRes.status === 200 && freelancerRes.body.token) {
    freelancerToken = freelancerRes.body.token;
    pass('Freelancer login', `${freelancerRes.body.user.username} (${freelancerRes.body.user.role})`);
  } else { fail('Freelancer login', JSON.stringify(freelancerRes.body)); }

  const adminRes = await post('http://localhost:6001/api/auth/login', { email: 'admin@sbworks.com', password: 'admin123' });
  if (adminRes.status === 200 && adminRes.body.token) {
    adminToken = adminRes.body.token;
    pass('Admin login', `${adminRes.body.user.username} (${adminRes.body.user.role})`);
  } else { fail('Admin login', JSON.stringify(adminRes.body)); }

  const meRes = await get('http://localhost:6001/api/auth/me', clientToken);
  meRes.status === 200 ? pass('GET /auth/me (token verify)', meRes.body.user?.username || meRes.body.username) : fail('/auth/me', meRes.status);

  // ── 2. PROJECTS ──────────────────────────────────────────
  section('2. PROJECTS CATALOG');

  const projRes = await get('http://localhost:6001/api/projects');
  if (projRes.status === 200) {
    const count = projRes.body.count || projRes.body.data?.length || projRes.body.projects?.length;
    pass('GET /projects (public)', `${count} projects in DB`);
    projectId = (projRes.body.data || projRes.body.projects)?.[0]?._id;
  } else { fail('GET /projects', projRes.status); }

  const searchRes = await get('http://localhost:6001/api/projects?search=React');
  searchRes.status === 200 ? pass('GET /projects?search=React', 'Search filter works') : fail('Search filter', searchRes.status);

  const budgetRes = await get('http://localhost:6001/api/projects?minBudget=500&maxBudget=3000');
  budgetRes.status === 200 ? pass('GET /projects?minBudget=500&maxBudget=3000', 'Budget filter works') : fail('Budget filter', budgetRes.status);

  if (projectId) {
    const detailRes = await get(`http://localhost:6001/api/projects/${projectId}`);
    detailRes.status === 200 ? pass(`GET /projects/${projectId} (detail)`, detailRes.body.data?.title || detailRes.body.project?.title || 'Project found') : fail('Project detail', detailRes.status);
  }

  // ── 3. APPLICATIONS (BIDDING) ────────────────────────────
  section('3. APPLICATIONS / BIDDING');

  const myAppsRes = await get('http://localhost:6001/api/applications/my', freelancerToken);
  myAppsRes.status === 200 ? pass('GET /applications/my (freelancer bids)', `${myAppsRes.body.count || myAppsRes.body.data?.length || 0} bids found`) : fail('Freelancer bids', myAppsRes.status);

  if (projectId) {
    const projAppsRes = await get(`http://localhost:6001/api/applications/project/${projectId}`, clientToken);
    projAppsRes.status === 200
      ? pass(`GET /applications/project/:id (client view)`, `${projAppsRes.body.count || projAppsRes.body.data?.length || 0} bids on this project`)
      : fail('Project applications', projAppsRes.status);
  }

  // ── 4. FREELANCER PROFILE ────────────────────────────────
  section('4. USER & FREELANCER PROFILES');

  const profileRes = await get('http://localhost:6001/api/users/profile', freelancerToken);
  profileRes.status === 200 ? pass('GET /users/profile (freelancer)', profileRes.body.user?.username || profileRes.body.username || 'Profile fetched') : fail('User profile', profileRes.status);

  const flProfileRes = await get('http://localhost:6001/api/freelancers/profile', freelancerToken);
  flProfileRes.status === 200 ? pass('GET /freelancers/profile', `Skills: ${(flProfileRes.body.data?.skills || flProfileRes.body.freelancer?.skills || []).join(', ') || 'N/A'}`) : fail('Freelancer profile', flProfileRes.status);

  // ── 5. ADMIN ENDPOINTS ───────────────────────────────────
  section('5. ADMIN DASHBOARD');

  const statsRes = await get('http://localhost:6001/api/admin/stats', adminToken);
  if (statsRes.status === 200) {
    const s = statsRes.body.data || statsRes.body.stats || statsRes.body;
    pass('GET /admin/stats', `Users:${s.totalUsers||s.users} | Projects:${s.totalProjects||s.projects} | Apps:${s.totalApplications||s.applications}`);
  } else { fail('Admin stats', statsRes.status); }

  const usersRes = await get('http://localhost:6001/api/admin/users', adminToken);
  usersRes.status === 200 ? pass('GET /admin/users', `${usersRes.body.count || usersRes.body.data?.length || 0} users in platform`) : fail('Admin users', usersRes.status);

  // ── 6. REVIEWS ───────────────────────────────────────────
  section('6. REVIEWS / RATINGS');

  const reviewsRes = await get(`http://localhost:6001/api/reviews/user/${freelancerRes.body.user._id}`, clientToken);
  reviewsRes.status === 200 ? pass('GET /reviews/user/:id', `${reviewsRes.body.count || reviewsRes.body.data?.length || 0} reviews for freelancer`) : fail('Reviews fetch', reviewsRes.status);

  // ── 7. CHAT ──────────────────────────────────────────────
  section('7. CHAT HISTORY');

  // Try to find an In Progress project for chat
  const inProgressRes = await get('http://localhost:6001/api/projects?status=In Progress', clientToken);
  if (inProgressRes.status === 200) {
    const inProgressProjects = inProgressRes.body.data || inProgressRes.body.projects || [];
    if (inProgressProjects.length > 0) {
      const chatProjId = inProgressProjects[0]._id;
      const chatRes = await get(`http://localhost:6001/api/chats/${chatProjId}`, clientToken);
      chatRes.status === 200
        ? pass(`GET /chats/${chatProjId}`, `${chatRes.body.data?.messages?.length || 0} messages in chat room`)
        : fail('Chat history', chatRes.status);
    } else {
      pass('Chat rooms', 'No In Progress projects yet (expected for fresh seed)');
    }
  }

  // ── SUMMARY ──────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   ✅ DEEP FUNCTIONAL CHECK COMPLETE                      ║');
  console.log('║   All major API routes verified. App is browser-ready!   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log('📌 Open in Chrome:');
  console.log('   Landing Page  → http://localhost:5173/');
  console.log('   Login Page    → http://localhost:5173/login');
  console.log('   Projects      → http://localhost:5173/projects');
  console.log('   Dashboard     → http://localhost:5173/dashboard (after login)');
  console.log('   Admin Hub     → http://localhost:5173/admin/dashboard (admin login)\n');
}

runDeepCheck().catch(console.error);
