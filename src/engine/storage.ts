import type {
  PlayerProfile,
  GameSettings,
  RunRecord,
  CharacterSkin,
  RunningTrail,
  RunnerTitle,
  ChallengeDef
} from '../types/game';

const PROFILE_KEY = 'typing_runner_profile_v1';
const SETTINGS_KEY = 'typing_runner_settings_v1';

export const SKINS_CATALOG: CharacterSkin[] = [
  {
    id: 'cyber_runner',
    name: 'Cybernetic Strider',
    description: 'Standard issue high-mobility agile frame with neon telemetry circuits.',
    price: 0,
    unlocked: true,
    colors: {
      suit: '#0ea5e9',
      trim: '#38bdf8',
      visor: '#38bdf8',
      cape: '#0284c7'
    }
  },
  {
    id: 'shadow_ninja',
    name: 'Umbral Shinobi',
    description: 'Stealth-cloaked operative designed for silence and hyper-reflexes.',
    price: 350,
    unlocked: false,
    colors: {
      suit: '#1e1b4b',
      trim: '#a855f7',
      visor: '#c084fc',
      cape: '#581c87'
    }
  },
  {
    id: 'storm_nomad',
    name: 'Wasteland Nomad',
    description: 'Rugged survivalist wrapped in storm-tested amber dust cloaks.',
    price: 600,
    unlocked: false,
    colors: {
      suit: '#78350f',
      trim: '#f59e0b',
      visor: '#fbbf24',
      cape: '#d97706'
    }
  },
  {
    id: 'neon_valkyrie',
    name: 'Valkyrie Vanguard',
    description: 'Electrified war-frame pulsing with raw radiant kinetic energy.',
    price: 1000,
    unlocked: false,
    colors: {
      suit: '#831843',
      trim: '#f43f5e',
      visor: '#fb7185',
      cape: '#be123c'
    }
  },
  {
    id: 'void_phantom',
    name: 'Void Singularity',
    description: 'A phased entity woven from anti-matter and starlight.',
    price: 1600,
    unlocked: false,
    colors: {
      suit: '#030712',
      trim: '#10b981',
      visor: '#34d399',
      cape: '#064e3b'
    }
  }
];

export const TRAILS_CATALOG: RunningTrail[] = [
  {
    id: 'cyan_glow',
    name: 'Cyan Velocity',
    description: 'Crisp azure kinetic trails that streak across the ground.',
    price: 0,
    unlocked: true,
    particleColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)'
  },
  {
    id: 'fire_ember',
    name: 'Blazing Embers',
    description: 'Hot coals and sparks erupt from each accelerating footstep.',
    price: 300,
    unlocked: false,
    particleColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.5)'
  },
  {
    id: 'lightning_volt',
    name: 'Thunder Arc',
    description: 'Crackling electric micro-bolts branch off your heels.',
    price: 550,
    unlocked: false,
    particleColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.5)'
  },
  {
    id: 'frost_aura',
    name: 'Cryo Glaze',
    description: 'Sub-zero crystal plumes freeze the path in your wake.',
    price: 750,
    unlocked: false,
    particleColor: '#a5f3fc',
    glowColor: 'rgba(165, 243, 252, 0.5)'
  },
  {
    id: 'rainbow_star',
    name: 'Prismatic Stardust',
    description: 'Dazzling cosmic rainbow dust commemorating top-tier typists.',
    price: 1200,
    unlocked: false,
    particleColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.5)'
  }
];

export const TITLES_CATALOG: RunnerTitle[] = [
  { id: 'fledgling', title: 'Road Novice', requirement: 'Initial title', unlocked: true },
  { id: 'speed_demon', title: 'Speed Demon', requirement: 'Reach 60 WPM in a run', unlocked: false },
  { id: 'perfect_typist', title: 'Perfect Typist', requirement: 'Achieve 98% accuracy', unlocked: false },
  { id: 'storm_runner', title: 'Storm Runner', requirement: 'Survive any natural disaster', unlocked: false },
  { id: 'beast_slayer', title: 'Beast Slayer', requirement: 'Escape 3 mythical creatures', unlocked: false },
  { id: 'keyboard_warrior', title: 'Keyboard Warrior', requirement: 'Type 1,000 words total', unlocked: false },
  { id: 'apex_survivor', title: 'Apex Survivor', requirement: 'Achieve a 100+ combo streak', unlocked: false }
];

export const CHALLENGES_LIST: ChallengeDef[] = [
  {
    id: 'speed_gate_50',
    title: 'Velocity Trial: 50 WPM',
    description: 'Maintain 50+ WPM against Ignis the Ancient Drake for 60 seconds.',
    targetWpm: 50,
    targetAccuracy: 90,
    timeLimitSeconds: 60,
    chaserId: 'dragon',
    rewardCoins: 200,
    rewardXp: 400
  },
  {
    id: 'zero_mistakes',
    title: 'Flawless Flight',
    description: 'Survive 400 meters of the F5 Hyper-Twister with 0 typing errors.',
    targetWpm: 35,
    targetAccuracy: 100,
    chaserId: 'tornado',
    targetDistanceMeters: 400,
    zeroMistakesAllowed: true,
    rewardCoins: 350,
    rewardXp: 600
  },
  {
    id: 'punctuation_master',
    title: 'Syntax Crucible',
    description: 'Outrun the Jormungandr Serpent through punctuation-heavy passages.',
    targetWpm: 45,
    targetAccuracy: 94,
    timeLimitSeconds: 75,
    chaserId: 'serpent',
    rewardCoins: 250,
    rewardXp: 500
  },
  {
    id: 'hyper_sprint',
    title: 'Pyroclastic Sprint',
    description: 'Run 800 meters escaping the Volcanic Eruption at blistering speed.',
    targetWpm: 60,
    targetAccuracy: 92,
    chaserId: 'volcanic_eruption',
    targetDistanceMeters: 800,
    rewardCoins: 450,
    rewardXp: 800
  }
];

export const DEFAULT_PROFILE: PlayerProfile = {
  username: 'Runner-01',
  coins: 100,
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
};

export const DEFAULT_SETTINGS: GameSettings = {
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
};

export class StorageManager {
  public static getProfile(): PlayerProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PROFILE;
  }

  public static saveProfile(profile: PlayerProfile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // Storage quota or disabled
    }
  }

  public static getSettings(): GameSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  }

  public static saveSettings(settings: GameSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Fallback
    }
  }

  public static recordRun(record: RunRecord): { profile: PlayerProfile; isNewBest: boolean } {
    const profile = this.getProfile();
    let isNewBest = false;

    if (record.score > profile.bestScore) {
      profile.bestScore = record.score;
      isNewBest = true;
    }
    if (record.wpm > profile.bestWpm) {
      profile.bestWpm = record.wpm;
    }
    if (record.accuracy > profile.bestAccuracy) {
      profile.bestAccuracy = record.accuracy;
    }
    if (record.maxCombo > profile.bestStreak) {
      profile.bestStreak = record.maxCombo;
    }

    profile.totalRuns += 1;
    profile.totalPlaytimeSeconds += Math.round(record.survivalSeconds);
    profile.totalDistanceMeters += Math.round(record.distanceMeters);
    profile.coins += record.coinsEarned;
    profile.xp += record.xpEarned;

    // Check level up (e.g. 500 XP per level)
    const requiredXp = profile.level * 450;
    while (profile.xp >= requiredXp) {
      profile.xp -= requiredXp;
      profile.level += 1;
      profile.coins += 150; // Level up coin bonus!
    }

    // Record chaser encounters
    profile.chasersEncountered[record.chaserId] = (profile.chasersEncountered[record.chaserId] || 0) + 1;
    if (record.won) {
      profile.chasersEscaped[record.chaserId] = (profile.chasersEscaped[record.chaserId] || 0) + 1;
    }

    // Check titles unlocks
    if (record.wpm >= 60 && !profile.unlockedTitles.includes('speed_demon')) {
      profile.unlockedTitles.push('speed_demon');
    }
    if (record.accuracy >= 98 && !profile.unlockedTitles.includes('perfect_typist')) {
      profile.unlockedTitles.push('perfect_typist');
    }
    if (record.won && !profile.unlockedTitles.includes('storm_runner')) {
      profile.unlockedTitles.push('storm_runner');
    }
    if (record.maxCombo >= 100 && !profile.unlockedTitles.includes('apex_survivor')) {
      profile.unlockedTitles.push('apex_survivor');
    }

    // Keep last 30 runs for analytics
    profile.recentRuns.unshift(record);
    if (profile.recentRuns.length > 30) {
      profile.recentRuns.pop();
    }

    this.saveProfile(profile);
    return { profile, isNewBest };
  }
}
