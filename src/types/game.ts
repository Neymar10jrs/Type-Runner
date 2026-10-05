export type ChaserCategory = 'creature' | 'disaster';

export type ChaserId =
  | 'dragon'
  | 'kraken'
  | 'werewolf'
  | 'serpent'
  | 'shadow_monster'
  | 'ancient_golem'
  | 'fire_elemental'
  | 'tornado'
  | 'tsunami'
  | 'wildfire'
  | 'avalanche'
  | 'volcanic_eruption';

export type EnvironmentId =
  | 'ancient_forest'
  | 'volcanic_badlands'
  | 'frozen_pass'
  | 'coastal_ruins'
  | 'stormy_plains'
  | 'cyber_highway'
  | 'haunted_woods'
  | 'ocean_shore';

export type GameMode =
  | 'endless'
  | 'time_attack'
  | 'disaster_run'
  | 'creature_hunt'
  | 'practice'
  | 'challenge';

export type DifficultyLevel = 'beginner' | 'improving' | 'advanced' | 'expert';

export type PlayerActionState =
  | 'idle'
  | 'running'
  | 'sprint'
  | 'jumping'
  | 'sliding'
  | 'stumbling'
  | 'recovering'
  | 'victory'
  | 'defeat';

export type ObstacleType =
  | 'fallen_tree'
  | 'rock_spike'
  | 'fire_pit'
  | 'broken_bridge'
  | 'ice_chasm'
  | 'falling_debris'
  | 'rolling_boulder'
  | 'lightning_zone';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number; // world x position in meters
  y: number; // ground level offset
  width: number;
  height: number;
  cleared: boolean;
  failed: boolean;
  requiredSpeed: number; // Speed to clear automatically
  actionWord: string; // e.g. "JUMP", "SLIDE", "DODGE"
  label: string;
}

export interface ChaserConfig {
  id: ChaserId;
  name: string;
  title: string;
  category: ChaserCategory;
  environment: EnvironmentId;
  baseSpeed: number; // meters/sec
  color: string;
  secondaryColor: string;
  lore: string;
  roarText: string;
  threatDescription: string;
}

export interface EnvironmentConfig {
  id: EnvironmentId;
  name: string;
  skyGradient: [string, string];
  sunColor: string;
  fogColor: string;
  mountainColor: string;
  midgroundColor: string;
  groundColor: string;
  roadAccent: string;
  particleType: 'leaves' | 'rain' | 'snow' | 'embers' | 'dust' | 'bubbles' | 'lightning';
}

export interface TypingStats {
  wpm: number;
  rawWpm: number;
  cpm: number;
  accuracy: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  mistakes: number;
  /** Mistakes not corrected by backspace — used for Flawless Flight */
  uncorrectedErrors: number;
  wordsCompleted: number;
  currentStreak: number;
  bestStreak: number;
  comboMultiplier: number;
  distanceMeters: number;
  chaserDistanceMeters: number;
  survivalSeconds: number;
  score: number;
  obstaclesCleared: number;
  obstaclesFailed: number;
}

export interface RollingWindowStats {
  recentAccuracy: number;
  recentWpm: number;
  reactionTimeMs: number;
  keystrokeTimestamps: number[];
  recentErrors: number;
}

export interface CharacterSkin {
  id: string;
  name: string;
  description: string;
  price: number;
  unlocked: boolean;
  colors: {
    suit: string;
    trim: string;
    visor: string;
    cape: string;
  };
}

export interface RunningTrail {
  id: string;
  name: string;
  description: string;
  price: number;
  unlocked: boolean;
  particleColor: string;
  glowColor: string;
}

export interface RunnerTitle {
  id: string;
  title: string;
  requirement: string;
  unlocked: boolean;
}

export interface PlayerProfile {
  username: string;
  coins: number;
  xp: number;
  level: number;
  equippedSkin: string;
  equippedTrail: string;
  equippedTitle: string;
  unlockedSkins: string[];
  unlockedTrails: string[];
  unlockedTitles: string[];
  totalRuns: number;
  totalPlaytimeSeconds: number;
  totalWordsTyped: number;
  totalDistanceMeters: number;
  bestWpm: number;
  bestAccuracy: number;
  bestStreak: number;
  bestScore: number;
  chasersEscaped: Record<string, number>;
  chasersEncountered: Record<string, number>;
  recentRuns: RunRecord[];
}

export type UserProfile = PlayerProfile;

export interface RunRecord {
  id: string;
  timestamp: number;
  mode: GameMode;
  chaserId: ChaserId;
  chaserName: string;
  wpm: number;
  maxWpm: number;
  accuracy: number;
  score: number;
  distanceMeters: number;
  survivalSeconds: number;
  won: boolean;
  maxCombo: number;
  coinsEarned: number;
  xpEarned: number;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  keyboardSoundType: 'mechanical' | 'thock' | 'typewriter' | 'synth' | 'silent';
  fontSize: 'small' | 'medium' | 'large' | 'huge';
  dyslexiaFont: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  /** Replace strobing lightning with a slow fade. WCAG 2.3.1: ≤3 flashes/sec */
  reducedFlashing: boolean;
  /** Add underline/strikethrough/icon cues so correct/wrong is never color-only */
  colorblindMode: boolean;
  /** Persist mute state across sessions */
  muteAudio: boolean;
  screenShake: boolean;
}

export interface ChallengeDef {
  id: string;
  title: string;
  description: string;
  targetWpm: number;
  targetAccuracy: number;
  timeLimitSeconds?: number;
  chaserId: ChaserId;
  targetDistanceMeters?: number;
  zeroMistakesAllowed?: boolean;
  rewardCoins: number;
  rewardXp: number;
}
