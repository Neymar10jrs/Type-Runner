import React, { useRef, useEffect, useCallback, useState } from 'react';
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
  BookOpen,
  AlertCircle
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobileWarningVisible, setIsMobileWarningVisible] = useState(() => {
    // Show notice only on narrow screens + only once per session
    const dismissed = sessionStorage.getItem('tr_mobile_notice_dismissed');
    return !dismissed && window.innerWidth < 768;
  });

  // ── FOCUS MANAGEMENT ──────────────────────────────────────────────────────
  // Keep the hidden input focused at all times so typing works on desktop.
  // On mobile, tapping the game area should also open the soft keyboard.
  useEffect(() => {
    const focusInput = () => {
      if (!isPaused && hiddenInputRef.current) {
        hiddenInputRef.current.focus({ preventScroll: true });
      }
    };
    focusInput();
    const interval = setInterval(focusInput, 1500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // ── VISUAL VIEWPORT: keep typing box visible above soft keyboard ──────────
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const applyViewport = () => {
      if (!containerRef.current) return;
      // Pin the container height to the visible area
      const visibleHeight = vv.height;
      containerRef.current.style.height = `${visibleHeight}px`;
      // Account for scroll offset (iOS Safari scrolls viewport)
      containerRef.current.style.transform = `translateY(${vv.offsetTop}px)`;
    };

    vv.addEventListener('resize', applyViewport, { passive: true });
    vv.addEventListener('scroll', applyViewport, { passive: true });
    applyViewport(); // initial
    return () => {
      vv.removeEventListener('resize', applyViewport);
      vv.removeEventListener('scroll', applyViewport);
    };
  }, []);

  // ── MOBILE INPUT HANDLER ─────────────────────────────────────────────────
  // Mobile keyboards often don't fire reliable keydown events.
  // We use the input event on the hidden input instead.
  const pendingInputRef = useRef('');

  const handleHiddenInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const incoming = e.target.value;
      // Clear the input value immediately so it stays empty for next char
      e.target.value = '';

      if (!incoming) return;

      // On mobile, the input might accumulate multiple characters (predictive text).
      // Feed them one at a time.
      for (const ch of incoming) {
        onKeystroke(ch);
      }
      pendingInputRef.current = '';
    },
    [onKeystroke]
  );

  // Also handle beforeinput to intercept mobile autocorrect/delete
  const handleBeforeInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const ev = e as unknown as InputEvent;
      // On "deleteContentBackward" (mobile backspace)
      if (ev.inputType === 'deleteContentBackward') {
        ev.preventDefault();
        onBackspace();
        return;
      }
      // On insertText (standard mobile typing)
      if (ev.inputType === 'insertText' && ev.data) {
        ev.preventDefault();
        for (const ch of ev.data) {
          onKeystroke(ch);
        }
      }
    },
    [onKeystroke, onBackspace]
  );

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Chaser distance colour
  const maxDistanceGauge = 100;
  const distancePct = Math.min(100, Math.max(0, (stats.chaserDistanceMeters / maxDistanceGauge) * 100));
  const isDanger = stats.chaserDistanceMeters < 25;
  const isWarning = stats.chaserDistanceMeters >= 25 && stats.chaserDistanceMeters < 50;

  const fontSizes = {
    small: 'text-lg sm:text-xl',
    medium: 'text-xl sm:text-2xl',
    large: 'text-2xl sm:text-3xl',
    huge: 'text-3xl sm:text-4xl'
  };

  const modeChips: { id: GameMode; label: string; icon: React.ReactNode }[] = [
    { id: 'endless',       label: 'Endless Run',    icon: <Flame     className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'creature_hunt', label: 'Creature Hunt',  icon: <Crosshair className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'disaster_run',  label: 'Disaster Run',   icon: <Shield    className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'time_attack',   label: 'Time Attack',    icon: <Clock     className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'practice',      label: 'Practice Mode',  icon: <BookOpen  className="w-3.5 h-3.5 text-cyan-400" /> }
  ];

  // ── TYPING PASSAGE RENDERER ───────────────────────────────────────────────
  // With colorblind-mode: correct chars get underline, wrong chars get
  // strikethrough + a "×" prefix so the cue is never color-only.
  const renderTypingPassage = () => {
    const chars = currentText.split('');
    const typedChars = typedText.split('');
    const { colorblindMode } = settings;

    return (
      <div
        className={`font-mono tracking-wide leading-relaxed select-none ${fontSizes[settings.fontSize]} ${
          settings.dyslexiaFont ? 'font-dyslexic' : ''
        }`}
        aria-label="Typing target text"
        role="text"
      >
        {chars.map((char, index) => {
          let charClass = 'text-white/85 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]';
          const isCurrent = index === typedChars.length;
          let prefix = '';

          if (index < typedChars.length) {
            const typedChar = typedChars[index];
            if (typedChar === char) {
              // Correct character
              charClass = colorblindMode
                ? 'text-cyan-300 font-bold underline decoration-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]'
                : 'text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]';
            } else {
              // Wrong character — colorblind mode adds strikethrough + × prefix
              if (colorblindMode) {
                prefix = '×';
                charClass = 'text-red-400 bg-red-950/90 px-0.5 rounded line-through decoration-red-400 font-bold shadow-md';
              } else {
                charClass = 'text-red-400 bg-red-950/90 px-0.5 rounded underline decoration-red-500 font-bold shadow-md';
              }
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
              aria-hidden="true"
            >
              {prefix}{char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </div>
    );
  };

  // Flawless Flight live counter
  const isFlawlessFlight = activeChallenge?.zeroMistakesAllowed;
  const uncorrectedErrors = stats.uncorrectedErrors ?? 0;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden"
      style={{ top: 0, left: 0, right: 0 }}
      onClick={() => hiddenInputRef.current?.focus({ preventScroll: true })}
    >
      {/* ── Mobile notice (first load on small screens) ── */}
      {isMobileWarningVisible && (
        <div
          role="alert"
          className="pointer-events-auto z-50 mb-2 mx-auto max-w-sm px-4 py-2.5 bg-amber-950/90 border border-amber-400/60 rounded-2xl text-amber-200 text-xs font-mono text-center flex items-center gap-2 shadow-lg backdrop-blur-sm"
        >
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Best played on a desktop keyboard, but mobile is supported. Tap the typing box to open your keyboard.</span>
          <button
            onClick={e => {
              e.stopPropagation();
              setIsMobileWarningVisible(false);
              sessionStorage.setItem('tr_mobile_notice_dismissed', '1');
            }}
            aria-label="Dismiss mobile notice"
            className="ml-1 text-amber-400 hover:text-white font-bold text-base leading-none"
          >✕</button>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <header className="flex flex-col gap-2 pointer-events-auto">
        {/* Row 1: Logo & Mode Chips & Tools */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Logo & Profile */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/85 border border-slate-800/90 backdrop-blur-md shadow-md">
              <Zap className="w-4 h-4 text-cyan-400 fill-current animate-pulse" aria-hidden="true" />
              <span className="font-heading font-black text-sm sm:text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                TYPING RUNNER
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 px-2.5 py-1 rounded-xl text-xs backdrop-blur-md">
              <span className="font-bold text-slate-300">Lv.{profile.level}</span>
              <span className="text-slate-600" aria-hidden="true">•</span>
              <div className="flex items-center gap-1 font-mono font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span aria-label={`${profile.coins} coins`}>{profile.coins}</span>
              </div>
            </div>
          </div>

          {/* Quick Mode Switcher Chips */}
          <nav
            aria-label="Quick mode switcher"
            className="hidden md:flex items-center gap-1.5 bg-slate-950/60 border border-slate-800/80 p-1 rounded-xl backdrop-blur-md"
          >
            {modeChips.map(m => {
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMode(m.id)}
                  aria-pressed={isActive}
                  aria-label={`Switch to ${m.label}`}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
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
              aria-label="Open challenges"
              className="px-3 py-1 rounded-lg text-xs font-bold text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 border border-amber-500/30 transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              Challenges
            </button>
          </nav>

          {/* Tools & Utilities */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenModes}
              aria-label="Return to mode selection screen"
              className="p-1.5 sm:px-2.5 sm:py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-md focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>Modes</span>
            </button>

            <button
              onClick={onResetRun}
              aria-label="Start a new run"
              className="p-1.5 sm:px-2.5 sm:py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-md focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span className="hidden sm:inline">New Encounter</span>
            </button>

            <button
              onClick={onOpenLocker}
              aria-label="Open locker (skins and trails)"
              className="p-1.5 sm:px-2.5 sm:py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-md focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              <Shirt className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
              <span className="hidden sm:inline">Locker</span>
            </button>

            <button
              onClick={onOpenStats}
              aria-label="Open statistics dashboard"
              className="p-1.5 sm:px-2.5 sm:py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-md focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span className="hidden sm:inline">Stats</span>
            </button>

            <button
              onClick={onOpenSettings}
              aria-label="Open settings and accessibility options"
              className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition shadow-md focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              <SettingsIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <button
              onClick={onPauseToggle}
              aria-label={isPaused ? 'Resume run' : 'Pause run (Escape)'}
              aria-pressed={isPaused}
              className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition shadow-md focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Row 2: Live Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: WPM & Accuracy */}
          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl shadow-lg">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" aria-hidden="true" />
              <div>
                <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Velocity</div>
                <div className="text-base sm:text-lg font-bold font-mono text-amber-300 leading-tight" aria-label={`${Math.round(stats.wpm)} words per minute`}>
                  {Math.round(stats.wpm)} <span className="text-[10px] font-normal text-slate-400">WPM</span>
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800" aria-hidden="true" />

            <div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Precision</div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 leading-tight" aria-label={`${Math.round(stats.accuracy)} percent accuracy`}>
                {Math.round(stats.accuracy)}<span className="text-[10px] font-normal text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* Center: Mode-specific gauges */}
          {mode === 'practice' && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/80 backdrop-blur-md text-cyan-200 shadow-lg">
              <BookOpen className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span className="text-xs font-bold tracking-wide">ZEN PRACTICE • ZERO CHASER PRESSURE</span>
              {onFinishPractice && (
                <button
                  onClick={onFinishPractice}
                  aria-label="Finish practice session and view stats"
                  className="ml-2 px-2.5 py-0.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-black tracking-wider transition shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                >
                  FINISH SESSION
                </button>
              )}
            </div>
          )}

          {mode === 'time_attack' && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/80 backdrop-blur-md text-emerald-200 shadow-lg">
              <Clock className="w-4 h-4 text-emerald-400 animate-pulse" aria-hidden="true" />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">Sprint Countdown:</span>
                <span
                  className={`font-mono font-black text-sm ${Math.max(0, 90 - stats.survivalSeconds) <= 15 ? 'text-red-400 animate-bounce' : 'text-emerald-300'}`}
                  aria-live="polite"
                  aria-label={`${formatTime(Math.max(0, 90 - stats.survivalSeconds))} remaining`}
                >
                  {formatTime(Math.max(0, 90 - stats.survivalSeconds))}
                </span>
              </div>
              <div className="w-20 sm:w-28 h-2 bg-slate-950/90 rounded-full overflow-hidden border border-emerald-700/60" role="progressbar" aria-label="Time remaining" aria-valuenow={Math.max(0, 90 - stats.survivalSeconds)} aria-valuemin={0} aria-valuemax={90}>
                <div
                  className="h-full bg-emerald-400 transition-all duration-200 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, ((90 - stats.survivalSeconds) / 90) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {activeChallenge && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-amber-500/60 bg-amber-950/80 backdrop-blur-md text-amber-200 shadow-lg">
              <Award className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">{activeChallenge.title}:</span>
                {activeChallenge.targetDistanceMeters && (
                  <span className="font-mono text-xs font-bold text-amber-200" aria-live="polite">
                    {Math.min(activeChallenge.targetDistanceMeters, Math.round(stats.distanceMeters))}/{activeChallenge.targetDistanceMeters}m
                  </span>
                )}
                {activeChallenge.timeLimitSeconds && (
                  <span className="font-mono text-xs font-bold text-amber-200" aria-live="polite">
                    {formatTime(Math.max(0, activeChallenge.timeLimitSeconds - stats.survivalSeconds))} left
                  </span>
                )}

                {/* ── Flawless Flight counter ── */}
                {isFlawlessFlight && (
                  <span
                    className={`font-mono text-xs font-bold flex items-center gap-1 ${uncorrectedErrors > 0 ? 'text-red-400' : 'text-emerald-400'}`}
                    aria-live="assertive"
                    aria-label={`${uncorrectedErrors} uncorrected errors`}
                    title="Flawless Flight counts only uncorrected errors. Wrong keypress + backspace = 0 errors."
                  >
                    {uncorrectedErrors === 0 ? '✓ Flawless' : `✗ ${uncorrectedErrors} uncorrected`}
                  </span>
                )}
              </div>
            </div>
          )}

          {isFlawlessFlight && (
            <div className="text-[10px] text-slate-400 font-mono italic" aria-live="off">
              Error = uncorrected wrong key. Backspace-corrected mistakes don't count.
            </div>
          )}

          {mode !== 'practice' && mode !== 'time_attack' && !activeChallenge && (
            <div
              className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-300 shadow-lg ${
                isDanger
                  ? 'bg-red-950/80 border-red-500/80 text-red-200'
                  : isWarning
                  ? 'bg-amber-950/70 border-amber-500/70 text-amber-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200'
              } ${isDanger && !settings.reducedFlashing ? 'animate-pulse' : ''}`}
              role="status"
              aria-label={`Pursuer distance: ${Math.round(stats.chaserDistanceMeters)} meters`}
            >
              <ShieldAlert className={`w-4 h-4 ${isDanger ? 'text-red-400' : 'text-slate-400'}`} aria-hidden="true" />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 hidden sm:inline">
                  {mode === 'disaster_run' ? 'Cataclysm' : 'Pursuer'}: <strong className="text-slate-200">{chaser.name}</strong>
                </span>
                <span className="font-mono font-black text-sm text-cyan-300" aria-live="off">
                  {Math.round(stats.chaserDistanceMeters)}m
                </span>
                {mode === 'creature_hunt' && (
                  <span className="text-[10px] text-purple-300 font-mono hidden md:inline">(Outrun to 95m!)</span>
                )}
                {mode === 'disaster_run' && (
                  <span className="text-[10px] text-blue-300 font-mono hidden md:inline">(Reach 1,000m bunker!)</span>
                )}
              </div>

              <div
                className="w-20 sm:w-28 h-2 bg-slate-950/90 rounded-full overflow-hidden border border-slate-700/60"
                role="progressbar"
                aria-label="Distance from pursuer"
                aria-valuenow={Math.round(stats.chaserDistanceMeters)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full transition-all duration-200 rounded-full ${
                    isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${distancePct}%` }}
                />
              </div>
            </div>
          )}

          {/* Right: Combo & Score */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-md ${
                stats.currentStreak >= 50
                  ? 'bg-amber-950/80 border-amber-500/80'
                  : stats.currentStreak >= 25
                  ? 'bg-purple-950/80 border-purple-500/80'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
              aria-label={`Combo multiplier ${stats.comboMultiplier.toFixed(1)}, streak ${stats.currentStreak}`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
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
                <div className="text-xs sm:text-sm font-bold font-mono text-purple-300 leading-tight" aria-live="off">
                  {stats.score.toLocaleString()}
                </div>
              </div>

              <div className="h-5 w-px bg-slate-800" aria-hidden="true" />

              <div className="flex items-center gap-1 text-slate-300 font-mono text-xs" aria-label={`Time: ${formatTime(stats.survivalSeconds)}`}>
                <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                {formatTime(stats.survivalSeconds)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── OBSTACLE ALERT ── */}
      {activeObstacle && !activeObstacle.cleared && (
        <div className="self-center my-auto pointer-events-auto" role="alert" aria-live="assertive">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-bounce text-cyan-200 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span className="text-xs uppercase font-bold tracking-wider">OBSTACLE APPROACHING:</span>
            <span className="font-mono font-black text-base text-white tracking-widest px-2 py-0.5 rounded bg-cyan-900/90 shadow-md">
              TYPE "{activeObstacle.actionWord}"
            </span>
          </div>
        </div>
      )}

      {/* ── BOTTOM TYPING INTERFACE ── */}
      <footer
        className="w-full max-w-4xl mx-auto pointer-events-auto pb-2"
        role="region"
        aria-label="Typing interface"
      >
        <div
          onClick={() => hiddenInputRef.current?.focus({ preventScroll: true })}
          onTouchStart={() => hiddenInputRef.current?.focus({ preventScroll: true })}
          className="relative cursor-text bg-black/20 hover:bg-black/30 border border-cyan-400/35 hover:border-cyan-400/70 rounded-3xl p-3 sm:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.35)] transition-all duration-200"
          style={{ backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(1px)' }}
        >
          {/* Soft-keyboard friendly input positioned directly in the typing box */}
          <input
            ref={hiddenInputRef}
            data-game-input="true"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="opacity-0 absolute inset-0 w-full h-full pointer-events-none"
            value=""
            onChange={handleHiddenInputChange}
            onBeforeInput={handleBeforeInput}
            tabIndex={0}
            aria-label="Typing input — tap here to open keyboard and play"
            aria-live="off"
          />

          {/* Header indicator */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2 pb-1.5 border-b border-cyan-500/20">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              <Compass className="w-4 h-4 animate-spin" aria-hidden="true" />
              {stats.totalKeystrokes === 0
                ? 'START TYPING TO SPRINT • WATCH YOUR RUNNER IN ACTION'
                : 'TYPING CONTROLS RUNNER STRIDE & MOMENTUM'}
            </span>
            <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-slate-300" aria-live="polite">
              Words completed: <strong className="text-white font-mono">{stats.wordsCompleted}</strong>
            </span>
          </div>

          {/* Typing passage */}
          <div className="min-h-[60px] flex items-center my-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            {renderTypingPassage()}
          </div>

          {/* Quick guidance footer */}
          <div className="mt-2 pt-1.5 border-t border-cyan-500/20 flex items-center justify-between text-[11px] text-slate-300 font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            <span>Press keys to run • Tap this box on mobile to open keyboard</span>
            <span className="text-slate-300">ESC: Pause / Resume</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
