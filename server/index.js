import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup
const allowedOrigins = [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in local development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Helper to load db
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = {
        profile: {
          username: 'Runner-01',
          coins: 150,
          xp: 0,
          level: 1,
          equippedSkin: 'cyber_runner',
          equippedTrail: 'cyan_glow',
          equippedTitle: 'Road Novice',
          unlockedSkins: ['cyber_runner'],
          unlockedTrails: ['cyan_glow'],
          unlockedTitles: ['fledgling'],
          totalRuns: 0,
          totalPlaytimeSeconds: 0,
          totalWordsTyped: 0,
          totalDistanceMeters: 0,
          bestWpm: 0,
          bestAccuracy: 0,
          bestStreak: 0,
          bestScore: 0,
          chasersEscaped: {},
          chasersEncountered: {},
          recentRuns: []
        },
        settings: {
          masterVolume: 0.8,
          musicVolume: 0.5,
          sfxVolume: 0.8,
          ambientVolume: 0.4,
          keyboardSoundType: 'mechanical',
          fontSize: 'large',
          dyslexiaFont: false,
          highContrast: false,
          reducedMotion: false,
          screenShake: true
        },
        runs: []
      };
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return { profile: {}, settings: {}, runs: [] };
  }
}

// Helper to save db
function saveDB(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Typing Runner API', timestamp: Date.now() });
});

// GET /api/profile
app.get('/api/profile', (req, res) => {
  const db = loadDB();
  res.json({ success: true, profile: db.profile });
});

// POST /api/profile
app.post('/api/profile', (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid profile data' });
  }

  const db = loadDB();
  db.profile = {
    ...db.profile,
    ...updates,
    // Preserve core numerical metrics if not explicitly passed
    coins: typeof updates.coins === 'number' ? Math.max(0, updates.coins) : db.profile.coins,
    xp: typeof updates.xp === 'number' ? Math.max(0, updates.xp) : db.profile.xp,
    level: typeof updates.level === 'number' ? Math.max(1, updates.level) : db.profile.level
  };

  saveDB(db);
  res.json({ success: true, profile: db.profile });
});

// GET /api/settings
app.get('/api/settings', (req, res) => {
  const db = loadDB();
  res.json({ success: true, settings: db.settings });
});

// POST /api/settings
app.post('/api/settings', (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid settings data' });
  }

  const db = loadDB();
  db.settings = { ...db.settings, ...updates };
  saveDB(db);
  res.json({ success: true, settings: db.settings });
});

// GET /api/runs (optionally filtered by mode, e.g. /api/runs?mode=time_attack)
app.get('/api/runs', (req, res) => {
  const db = loadDB();
  const { mode } = req.query;

  let runs = db.runs || [];
  if (mode && typeof mode === 'string') {
    runs = runs.filter(r => r.mode === mode);
  }

  res.json({ success: true, total: runs.length, runs });
});

// POST /api/runs - records a run using the unified run data model
app.post('/api/runs', (req, res) => {
  const run = req.body;

  // Input validation
  const validModes = ['endless', 'time_attack', 'creature_hunt', 'practice', 'disaster_run', 'challenge'];
  if (!run || !validModes.includes(run.mode)) {
    return res.status(400).json({
      success: false,
      error: `Invalid mode. Must be one of: ${validModes.join(', ')}`
    });
  }

  const db = loadDB();
  const profile = db.profile;

  // Standard run record model
  const standardizedRun = {
    id: run.id || Math.random().toString(36).substring(2, 9),
    timestamp: typeof run.timestamp === 'number' ? run.timestamp : Date.now(),
    mode: run.mode,
    wpm: Math.max(0, Math.round(Number(run.wpm) || 0)),
    accuracy: Math.min(100, Math.max(0, Math.round(Number(run.accuracy) || 0))),
    distance: Math.max(0, Math.round(Number(run.distance ?? run.distanceMeters) || 0)),
    score: Math.max(0, Math.round(Number(run.score) || 0)),
    coinsEarned: Math.max(0, Math.round(Number(run.coinsEarned) || 0)),
    xpEarned: Math.max(0, Math.round(Number(run.xpEarned) || 0)),
    duration: Math.max(0, Math.round(Number(run.duration ?? run.survivalSeconds) || 0)),
    chaserId: run.chaserId || 'dragon',
    chaserName: run.chaserName || 'Pursuer',
    won: Boolean(run.won),
    maxCombo: Math.max(0, Math.round(Number(run.maxCombo) || 0))
  };

  // Update profile metrics
  let isNewBest = false;
  if (standardizedRun.score > (profile.bestScore || 0)) {
    profile.bestScore = standardizedRun.score;
    isNewBest = true;
  }
  if (standardizedRun.wpm > (profile.bestWpm || 0)) {
    profile.bestWpm = standardizedRun.wpm;
  }
  if (standardizedRun.accuracy > (profile.bestAccuracy || 0)) {
    profile.bestAccuracy = standardizedRun.accuracy;
  }
  if (standardizedRun.maxCombo > (profile.bestStreak || 0)) {
    profile.bestStreak = standardizedRun.maxCombo;
  }

  profile.totalRuns = (profile.totalRuns || 0) + 1;
  profile.totalPlaytimeSeconds = (profile.totalPlaytimeSeconds || 0) + standardizedRun.duration;
  profile.totalDistanceMeters = (profile.totalDistanceMeters || 0) + standardizedRun.distance;
  profile.coins = (profile.coins || 0) + standardizedRun.coinsEarned;
  profile.xp = (profile.xp || 0) + standardizedRun.xpEarned;

  // Level up calculation (e.g. level * 450 XP required)
  let requiredXp = (profile.level || 1) * 450;
  while (profile.xp >= requiredXp) {
    profile.xp -= requiredXp;
    profile.level = (profile.level || 1) + 1;
    profile.coins += 150; // Level up coin award
    requiredXp = profile.level * 450;
  }

  // Update encounters and escapes
  if (!profile.chasersEncountered) profile.chasersEncountered = {};
  if (!profile.chasersEscaped) profile.chasersEscaped = {};

  profile.chasersEncountered[standardizedRun.chaserId] =
    (profile.chasersEncountered[standardizedRun.chaserId] || 0) + 1;

  if (standardizedRun.won) {
    profile.chasersEscaped[standardizedRun.chaserId] =
      (profile.chasersEscaped[standardizedRun.chaserId] || 0) + 1;
  }

  // Unlock title checks
  if (!profile.unlockedTitles) profile.unlockedTitles = ['fledgling'];
  if (standardizedRun.wpm >= 60 && !profile.unlockedTitles.includes('speed_demon')) {
    profile.unlockedTitles.push('speed_demon');
  }
  if (standardizedRun.accuracy >= 98 && !profile.unlockedTitles.includes('perfect_typist')) {
    profile.unlockedTitles.push('perfect_typist');
  }
  if (standardizedRun.won && !profile.unlockedTitles.includes('storm_runner')) {
    profile.unlockedTitles.push('storm_runner');
  }
  if (standardizedRun.maxCombo >= 100 && !profile.unlockedTitles.includes('apex_survivor')) {
    profile.unlockedTitles.push('apex_survivor');
  }

  // Prepend to recentRuns
  if (!profile.recentRuns) profile.recentRuns = [];
  profile.recentRuns.unshift(standardizedRun);
  if (profile.recentRuns.length > 50) {
    profile.recentRuns.pop();
  }

  // Append to master runs table
  if (!db.runs) db.runs = [];
  db.runs.unshift(standardizedRun);
  if (db.runs.length > 200) {
    db.runs.pop();
  }

  saveDB(db);

  res.status(201).json({
    success: true,
    run: standardizedRun,
    profile,
    isNewBest
  });
});

// GET /api/analytics - provides telemetry per mode
app.get('/api/analytics', (req, res) => {
  const db = loadDB();
  const runs = db.runs || [];

  const perMode = {};
  const modes = ['endless', 'time_attack', 'creature_hunt', 'practice', 'disaster_run', 'challenge'];

  modes.forEach(m => {
    const modeRuns = runs.filter(r => r.mode === m);
    const count = modeRuns.length;
    const avgWpm = count > 0 ? Math.round(modeRuns.reduce((acc, r) => acc + r.wpm, 0) / count) : 0;
    const maxWpm = count > 0 ? Math.max(...modeRuns.map(r => r.wpm)) : 0;
    const avgAcc = count > 0 ? Math.round(modeRuns.reduce((acc, r) => acc + r.accuracy, 0) / count) : 0;
    const totalDist = count > 0 ? modeRuns.reduce((acc, r) => acc + r.distance, 0) : 0;
    const wins = modeRuns.filter(r => r.won).length;

    perMode[m] = {
      runsCount: count,
      avgWpm,
      maxWpm,
      avgAccuracy: avgAcc,
      totalDistance: totalDist,
      escapesCount: wins
    };
  });

  res.json({
    success: true,
    overview: {
      totalRuns: profileTotal(db.profile).totalRuns,
      bestWpm: db.profile.bestWpm || 0,
      totalCoins: db.profile.coins || 0,
      level: db.profile.level || 1
    },
    perMode
  });
});

function profileTotal(profile) {
  return { totalRuns: profile?.totalRuns || 0 };
}

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Typing Runner Backend] API Server listening on http://127.0.0.1:${PORT}`);
});
