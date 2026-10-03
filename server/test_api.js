// Comprehensive end-to-end test of Typing Runner API
const BASE_URL = 'http://127.0.0.1:3001/api';

async function runTests() {
  console.log('--- Testing Typing Runner Backend API ---');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('1. Health check:', health.status === 'ok' ? 'PASS' : 'FAIL', health);

  // 2. Profile read
  const profileRes = await fetch(`${BASE_URL}/profile`);
  const profileData = await profileRes.json();
  console.log('2. GET /profile:', profileData.success ? 'PASS' : 'FAIL', {
    username: profileData.profile?.username,
    level: profileData.profile?.level,
    coins: profileData.profile?.coins,
    xp: profileData.profile?.xp
  });

  // 3. Profile update (Locker items, titles, coins)
  const updateRes = await fetch(`${BASE_URL}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      equippedSkin: 'cyber_runner',
      equippedTrail: 'cyan_glow',
      equippedTitle: 'Road Novice'
    })
  });
  const updateData = await updateRes.json();
  console.log('3. POST /profile:', updateData.success ? 'PASS' : 'FAIL');

  // 4. Test run records for ALL 6 modes
  const modesToTest = [
    { mode: 'endless', wpm: 68, acc: 96, dist: 950, dur: 110, score: 5800, chaser: 'dragon' },
    { mode: 'time_attack', wpm: 82, acc: 99, dist: 720, dur: 90, score: 6200, chaser: 'dragon' },
    { mode: 'creature_hunt', wpm: 74, acc: 95, dist: 830, dur: 85, score: 5100, chaser: 'kraken' },
    { mode: 'practice', wpm: 60, acc: 100, dist: 400, dur: 60, score: 3200, chaser: 'werewolf' },
    { mode: 'disaster_run', wpm: 78, acc: 97, dist: 1050, dur: 105, score: 7100, chaser: 'volcanic_eruption' },
    { mode: 'challenge', wpm: 85, acc: 98, dist: 600, dur: 65, score: 5400, chaser: 'tornado' }
  ];

  for (const m of modesToTest) {
    const runPayload = {
      mode: m.mode,
      wpm: m.wpm,
      accuracy: m.acc,
      distance: m.dist,
      score: m.score,
      coinsEarned: 80,
      xpEarned: 300,
      duration: m.dur,
      timestamp: Date.now(),
      chaserId: m.chaser,
      chaserName: m.chaser,
      won: true,
      maxCombo: 45
    };

    const runRes = await fetch(`${BASE_URL}/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(runPayload)
    });
    const runResult = await runRes.json();
    console.log(`4. POST /runs [${m.mode}]:`, runResult.success ? 'PASS' : 'FAIL', {
      isNewBest: runResult.isNewBest,
      profileLevel: runResult.profile?.level,
      profileCoins: runResult.profile?.coins
    });
  }

  // 5. Test filtered runs
  const filteredRes = await fetch(`${BASE_URL}/runs?mode=time_attack`);
  const filteredData = await filteredRes.json();
  console.log('5. GET /runs?mode=time_attack:', filteredData.success ? 'PASS' : 'FAIL', `Found ${filteredData.total} runs`);

  // 6. Test analytics aggregation
  const analyticsRes = await fetch(`${BASE_URL}/analytics`);
  const analyticsData = await analyticsRes.json();
  console.log('6. GET /analytics:', analyticsData.success ? 'PASS' : 'FAIL', {
    totalRuns: analyticsData.overview?.totalRuns,
    bestWpm: analyticsData.overview?.bestWpm,
    modesAggregated: Object.keys(analyticsData.perMode || {})
  });
}

runTests().catch(console.error);
