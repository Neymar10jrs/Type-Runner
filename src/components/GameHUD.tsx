import React, { useRef, useEffect } from 'react';
import type {
  TypingStats,
  DifficultyLevel,
  ChaserConfig,
  GameMode,
  Obstacle,
  GameSettings,
  PlayerProfile,
  ChallengeDef
} from '../types/game';
import {
  Flame,
  ShieldAlert,
  Zap,
  Clock,
  Compass,
  Pause,
  RotateCcw,
  Shirt,
  BarChart3,
  Settings as SettingsIcon,
  Sparkles,
  Award,
  Crosshair,
  Shield,
  BookOpen
} from 'lucide-react';

interface GameHUDProps {
  stats: TypingStats;
  difficulty: DifficultyLevel;
  chaser: ChaserConfig;
  mode: GameMode;
  currentText: string;
  typedText: string;
  activeObstacle: Obstacle | null;
  activeChallenge?: ChallengeDef | null;
  settings: GameSettings;
  profile: PlayerProfile;
  isPaused: boolean;
  onPauseToggle: () => void;
  onKeystroke: (char: string) => void;
  onBackspace: () => void;
  onSelectMode: (mode: GameMode) => void;
  onOpenLocker: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenChallenges: () => void;
  onResetRun: () => void;
  onOpenModes: () => void;
  onFinishPractice?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  difficulty,
  chaser,
  mode,
  currentText,
  typedText,
  activeObstacle,
  activeChallenge,
  settings,
  profile,
  isPaused,
  onPauseToggle,
  onKeystroke,
  onBackspace,
  onSelectMode,
  onOpenLocker,
  onOpenStats,
  onOpenSettings,
  onOpenChallenges,
  onResetRun,
  onOpenModes,
  onFinishPractice
}) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input so typing works seamlessly on all devices
  useEffect(() => {
    const focusInput = () => {
      if (!isPaused && hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    };
    focusInput();
    const interval = setInterval(focusInput, 1500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Handle keydown on input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isPaused) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      onBackspace();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onPauseToggle();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      onKeystroke(e.key);
    }
  };

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Chaser distance color and percentage
  const maxDistanceGauge = 100;
  const distancePct = Math.min(100, Math.max(0, (stats.chaserDistanceMeters / maxDistanceGauge) * 100));
  const isDanger = stats.chaserDistanceMeters < 25;
  const isWarning = stats.chaserDistanceMeters >= 25 && stats.chaserDistanceMeters < 50;

  // Font size classes
  const fontSizes = {
    small: 'text-lg sm:text-xl',
    medium: 'text-xl sm:text-2xl',
    large: 'text-2xl sm:text-3xl',
    huge: 'text-3xl sm:text-4xl'
  };

  // Mode chips configuration
  const modeChips: { id: GameMode; label: string; icon: React.ReactNode }[] = [
    { id: 'endless', label: 'Endless Run', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'creature_hunt', label: 'Creature Hunt', icon: <Crosshair className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'disaster_run', label: 'Disaster Run', icon: <Shield className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'time_attack', label: 'Time Attack', icon: <Clock className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'practice', label: 'Practice Mode', icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> }
  ];

  // Render typing passage with character-level accuracy highlighting and high-contrast text shadows
  const renderTypingPassage = () => {
    const chars = currentText.split('');
    const typedChars = typedText.split('');

    return (
      <div
        className={`font-mono tracking-wide leading-relaxed select-none ${fontSizes[settings.fontSize]} ${
          settings.dyslexiaFont ? 'font-dyslexic' : ''
        }`}
      >
        {chars.map((char, index) => {
          let charClass = 'text-white/85 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]'; // untyped
          const isCurrent = index === typedChars.length;

          if (index < typedChars.length) {
            const typedChar = typedChars[index];
            if (typedChar === char) {
              charClass = 'text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]';
            } else {
              charClass = 'text-red-400 bg-red-950/90 px-0.5 rounded underline decoration-red-500 font-bold shadow-md';
            }
          }

          return (
            <span
              key={index}
              className={`relative inline-block transition-colors duration-75 ${charClass} ${
                isCurrent
                  ? 'border-b-4 border-cyan-400 animate-pulse bg-cyan-950/60 px-0.5 rounded text-white shadow-[0_0_15px_rgba(56,189,248,0.9)]'
                  : ''
              }`}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden"
      onClick={() => hiddenInputRef.current?.focus()}
    >
      {/* Hidden input to capture physical keystrokes */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="opacity-0 absolute -top-96 left-0 pointer-events-auto"
        autoFocus
        value=""
        onChange={() => {}}
        onKeyDown={handleKeyDown}
      />

      {/* TOP BAR: GAME TITLE + QUICK MODES + PROFILE + TELEMETRY */}
      <header className="flex flex-col gap-2 pointer-events-auto">
        {/* Row 1: Logo & Mode Selection Chips & Tools */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Logo & Profile */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/85 border border-slate-800/90 backdrop-blur-md shadow-md">
              <Zap className="w-4 h-4 text-cyan-400 fill-current animate-pulse" />
              <span className="font-heading font-black text-sm sm:text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                TYPING RUNNER
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 px-2.5 py-1 rounded-xl text-xs backdrop-blur-md">
              <span className="font-bold text-slate-300">Lv.{profile.level}</span>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1 font-mono font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {profile.coins}
              </div>
            </div>
          </div>

          {/* Quick Mode Switcher Chips */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950/60 border border-slate-800/80 p-1 rounded-xl backdrop-blur-md">
            {modeChips.map(m => {
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMode(m.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              );
            })}

            <button
              onClick={onOpenChallenges}
              className="px-3 py-1 rounded-lg text-xs font-bold text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 border border-amber-500/30 transition flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Challenges
            </button>
          </div>

          {/* Tools & Utilities */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenModes}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-md"
              title="Return to Mode Selection Screen"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modes</span>
            </button>

            <button
              onClick={onResetRun}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-md"
              title="New Run / Next Chaser (R)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">New Encounter</span>
            </button>

            <button
              onClick={onOpenLocker}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-md"
              title="Locker (Skins & Trails)"
            >
              <Shirt className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Locker</span>
            </button>

            <button
              onClick={onOpenStats}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-md"
              title="Telemetry Analytics"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Stats</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition shadow-md"
              title="Settings & Accessibility"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onPauseToggle}
              className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition shadow-md"
              title="Pause Run (ESC)"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Live In-Game Telemetry Bar (Includes Pursuer Proximity Gauge to free up center canvas!) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Velocity & Precision */}
          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl shadow-lg">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <div>
                <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Velocity</div>
                <div className="text-base sm:text-lg font-bold font-mono text-amber-300 leading-tight">
                  {Math.round(stats.wpm)} <span className="text-[10px] font-normal text-slate-400">WPM</span>
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800" />

            <div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Precision</div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 leading-tight">
                {Math.round(stats.accuracy)}<span className="text-[10px] font-normal text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* Center: Mode-Specific Gauges */}
          {mode === 'practice' && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/80 backdrop-blur-md text-cyan-200 shadow-lg">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold tracking-wide">ZEN PRACTICE • ZERO CHASER PRESSURE</span>
              {onFinishPractice && (
                <button
                  onClick={onFinishPractice}
                  className="ml-2 px-2.5 py-0.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-black tracking-wider transition shadow-sm"
                  title="Conclude training session & view stats"
                >
                  FINISH SESSION
                </button>
              )}
            </div>
          )}

          {mode === 'time_attack' && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/80 backdrop-blur-md text-emerald-200 shadow-lg">
              <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">Sprint Countdown:</span>
                <span className={`font-mono font-black text-sm ${Math.max(0, 90 - stats.survivalSeconds) <= 15 ? 'text-red-400 animate-bounce' : 'text-emerald-300'}`}>
                  {formatTime(Math.max(0, 90 - stats.survivalSeconds))}
                </span>
              </div>
              <div className="w-20 sm:w-28 h-2 bg-slate-950/90 rounded-full overflow-hidden border border-emerald-700/60">
                <div
                  className="h-full bg-emerald-400 transition-all duration-200 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, ((90 - stats.survivalSeconds) / 90) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {activeChallenge && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-amber-500/60 bg-amber-950/80 backdrop-blur-md text-amber-200 shadow-lg">
              <Award className="w-4 h-4 text-amber-400" />
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">{activeChallenge.title}:</span>
                {activeChallenge.targetDistanceMeters && (
                  <span className="font-mono text-xs font-bold text-amber-200">
                    {Math.min(activeChallenge.targetDistanceMeters, Math.round(stats.distanceMeters))}/{activeChallenge.targetDistanceMeters}m
                  </span>
                )}
                {activeChallenge.timeLimitSeconds && (
                  <span className="font-mono text-xs font-bold text-amber-200">
                    {formatTime(Math.max(0, activeChallenge.timeLimitSeconds - stats.survivalSeconds))} left
                  </span>
                )}
                {activeChallenge.zeroMistakesAllowed && (
                  <span className={`font-mono text-xs font-bold ${stats.mistakes > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {stats.mistakes === 0 ? 'Flawless' : `${stats.mistakes} Misses`}
                  </span>
                )}
              </div>
            </div>
          )}

          {mode !== 'practice' && mode !== 'time_attack' && !activeChallenge && (
            <div
              className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-300 shadow-lg ${
                isDanger
                  ? 'bg-red-950/80 border-red-500/80 animate-pulse text-red-200'
                  : isWarning
                  ? 'bg-amber-950/70 border-amber-500/70 text-amber-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 ${isDanger ? 'text-red-400 animate-spin' : 'text-slate-400'}`} />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 hidden sm:inline">
                  {mode === 'disaster_run' ? 'Cataclysm' : 'Pursuer'}: <strong className="text-slate-200">{chaser.name}</strong>
                </span>
                <span className="font-mono font-black text-sm text-cyan-300">
                  {Math.round(stats.chaserDistanceMeters)}m
                </span>
                {mode === 'creature_hunt' && (
                  <span className="text-[10px] text-purple-300 font-mono hidden md:inline">(Outrun to 95m!)</span>
                )}
                {mode === 'disaster_run' && (
                  <span className="text-[10px] text-blue-300 font-mono hidden md:inline">(Reach 1,000m bunker!)</span>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-20 sm:w-28 h-2 bg-slate-950/90 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className={`h-full transition-all duration-200 rounded-full ${
                    isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${distancePct}%` }}
                />
              </div>
            </div>
          )}

          {/* Right: Combo & Score & Distance */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-md ${
                stats.currentStreak >= 50
                  ? 'bg-amber-950/80 border-amber-500/80'
                  : stats.currentStreak >= 25
                  ? 'bg-purple-950/80 border-purple-500/80'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-100">
                ×{stats.comboMultiplier.toFixed(1)}
              </span>
              <span className="text-[10px] font-bold text-amber-400 hidden sm:inline">
                ({stats.currentStreak})
              </span>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2.5">
              <div>
                <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Score</div>
                <div className="text-xs sm:text-sm font-bold font-mono text-purple-300 leading-tight">
                  {stats.score.toLocaleString()}
                </div>
              </div>

              <div className="h-5 w-px bg-slate-800" />

              <div className="flex items-center gap-1 text-slate-300 font-mono text-xs">
                <Clock className="w-3 h-3 text-slate-400" />
                {formatTime(stats.survivalSeconds)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ACTIVE OBSTACLE REACTION ALERT (Floats above see-through box when obstacle is near) */}
      {activeObstacle && !activeObstacle.cleared && (
        <div className="self-center my-auto pointer-events-auto">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-bounce text-cyan-200 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase font-bold tracking-wider">OBSTACLE APPROACHING:</span>
            <span className="font-mono font-black text-base text-white tracking-widest px-2 py-0.5 rounded bg-cyan-900/90 shadow-md">
              TYPE "{activeObstacle.actionWord}"
            </span>
          </div>
        </div>
      )}

      {/* BOTTOM TYPING INTERFACE (COMPLETELY SEE-THROUGH GLASS CONTAINER) */}
      <footer className="w-full max-w-4xl mx-auto pointer-events-auto pb-2">
        <div
          onClick={() => hiddenInputRef.current?.focus()}
          className="cursor-text bg-black/20 hover:bg-black/30 border border-cyan-400/35 hover:border-cyan-400/70 rounded-3xl p-4 sm:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.35)] transition-all duration-200"
          style={{
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)'
          }}
        >
          {/* Header indicator */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2 pb-1.5 border-b border-cyan-500/20">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              <Compass className="w-4 h-4 animate-spin" />
              {stats.totalKeystrokes === 0
                ? 'START TYPING TO SPRINT • WATCH YOUR RUNNER IN ACTION'
                : 'TYPING CONTROLS RUNNER STRIDE & MOMENTUM'}
            </span>
            <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-slate-300">
              Words completed: <strong className="text-white font-mono">{stats.wordsCompleted}</strong>
            </span>
          </div>

          {/* Prominent Sentence Display with high-contrast text shadow */}
          <div className="min-h-[60px] flex items-center my-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            {renderTypingPassage()}
          </div>

          {/* Quick guidance footer */}
          <div className="mt-2 pt-1.5 border-t border-cyan-500/20 flex items-center justify-between text-[11px] text-slate-300 font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            <span>Press keys to run • Character and scenery visible through glass</span>
            <span className="text-slate-300">ESC: Pause / Resume</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
