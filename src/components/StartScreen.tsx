import React, { useState, useEffect } from 'react';
import type { GameMode, PlayerProfile, GameSettings } from '../types/game';
import { CHASERS } from '../engine/chasers';
import { TextGenerator } from '../engine/textGenerator';
import { useShaderBackground } from '@/components/ui/animated-shader-hero';
import {
  Play,
  Crosshair,
  Clock,
  Shield,
  Zap,
  BookOpen,
  Shirt,
  BarChart3,
  Settings as SettingsIcon,
  Flame,
  Award,
  Sparkles,
  Compass,
  X,
  User
} from 'lucide-react';

interface StartScreenProps {
  profile: PlayerProfile;
  settings: GameSettings;
  initialSentence: string;
  onStartGame: (mode: GameMode, selectedChaserId?: string) => void;
  onOpenLocker: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenChallenges: () => void;
  onOpenLogin?: () => void;
  onOpenShaderHero?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  profile,
  settings,
  initialSentence,
  onStartGame,
  onOpenLocker,
  onOpenStats,
  onOpenSettings,
  onOpenChallenges,
  onOpenLogin,
  onOpenShaderHero
}) => {
  const [shaderBgEnabled, setShaderBgEnabled] = useState<boolean>(true);
  const shaderCanvasRef = useShaderBackground();
  const [selectedMode, setSelectedMode] = useState<GameMode>('endless');
  const [selectedChaserId, setSelectedChaserId] = useState<string>('dragon');
  const [showBeastPicker, setShowBeastPicker] = useState<boolean>(false);
  const [showDisasterPicker, setShowDisasterPicker] = useState<boolean>(false);

  // Allow pressing Enter on the start screen to immediately launch into the chosen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onStartGame(selectedMode, selectedChaserId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMode, selectedChaserId, onStartGame]);

  const chaserList = Object.values(CHASERS);
  const currentChaser = CHASERS[selectedChaserId as keyof typeof CHASERS] || chaserList[0];
  const previewSentence = TextGenerator.getModeInitialSentence(selectedMode, selectedChaserId);

  const modes: { id: GameMode; title: string; subtitle: string; icon: React.ReactNode; tag: string }[] = [
    {
      id: 'endless',
      title: 'Endless Run',
      subtitle: 'Infinite adaptive chase with randomized encounters and escalating speed.',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      tag: 'Flagship'
    },
    {
      id: 'creature_hunt',
      title: 'Creature Hunt',
      subtitle: 'Select and outrun legendary mythical beasts and alpha predators.',
      icon: <Crosshair className="w-5 h-5 text-purple-400" />,
      tag: 'Boss Chase'
    },
    {
      id: 'disaster_run',
      title: 'Disaster Run',
      subtitle: 'Flee catastrophic tornadoes, mega-tsunamis, and volcanic surges.',
      icon: <Shield className="w-5 h-5 text-blue-400" />,
      tag: 'Cataclysm'
    },
    {
      id: 'time_attack',
      title: 'Time Attack',
      subtitle: '90-second intense sprint to achieve maximum distance & high score.',
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
      tag: 'Speed Run'
    },
    {
      id: 'practice',
      title: 'Practice Mode',
      subtitle: 'Serene track with zero chaser pressure. Pure typing flow training.',
      icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
      tag: 'Training'
    }
  ];

  // Dynamic button label based on mode
  const getStartButtonLabel = () => {
    switch (selectedMode) {
      case 'endless':
        return 'START ENDLESS RUN';
      case 'creature_hunt':
        return `ESCAPE ${currentChaser.name.toUpperCase()}`;
      case 'disaster_run':
        return `OUTRUN ${currentChaser.name.toUpperCase()}`;
      case 'time_attack':
        return 'START 90s TIME ATTACK';
      case 'practice':
        return 'ENTER ZEN PRACTICE (NO CHASER)';
      default:
        return 'START RUN';
    }
  };

  return (
    <div
      className="relative z-10 w-full min-h-[100vh] min-h-[100dvh] flex flex-col justify-between p-4 sm:p-8 select-none bg-black/45 backdrop-blur-[2px] overflow-x-hidden"
      style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Animated WebGL Shader Background */}
      {shaderBgEnabled && (
        <canvas
          ref={shaderCanvasRef}
          className="fixed inset-0 w-full h-full object-cover pointer-events-none opacity-45 -z-10"
          style={{ background: '#030712' }}
        />
      )}

      {/* HEADER BAR: PROFILE & TOOLS */}
      <header className="flex flex-wrap items-center justify-between gap-3 w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-400 flex items-center justify-center font-bold text-lg shadow-lg shadow-cyan-500/30">
            {profile.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-slate-100">{profile.username}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded-full">
                {profile.equippedTitle}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Level {profile.level} • {profile.xp} XP
            </div>
          </div>
        </div>

        {/* Currency & Quick Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-amber-300 text-base">{profile.coins}</span>
            <span className="text-[10px] uppercase text-slate-400 font-bold">Coins</span>
          </div>

          {/* Runner Login / Identity Portal */}
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 px-3 py-2 rounded-xl transition text-xs font-semibold text-cyan-300 hover:text-white shadow-md shadow-cyan-500/10 cursor-pointer"
              title="Runner Login & Cloud Progress Sync"
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Portal</span>
            </button>
          )}

          {/* Shader Hero Preview */}
          {onOpenShaderHero && (
            <button
              onClick={onOpenShaderHero}
              className="flex items-center gap-1.5 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 hover:border-amber-400 px-3 py-2 rounded-xl transition text-xs font-semibold text-amber-300 hover:text-white cursor-pointer"
              title="View Animated Shader Hero Banner"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Shader Hero</span>
            </button>
          )}

          {/* Shader Background Toggle */}
          <button
            onClick={() => setShaderBgEnabled(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-bold transition cursor-pointer hidden lg:flex items-center gap-1 ${
              shaderBgEnabled
                ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle Animated Shader Background"
          >
            <span>Shader:</span>
            <span className={shaderBgEnabled ? 'text-cyan-400' : 'text-slate-500'}>
              {shaderBgEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            onClick={onOpenLocker}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition text-xs font-semibold text-slate-200"
            title="Character Skins & Trails"
          >
            <Shirt className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Locker</span>
          </button>

          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition text-xs font-semibold text-slate-200"
            title="Statistics & Charts"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition text-slate-300 hover:text-white"
            title="Settings & Accessibility"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO & MODE SELECTION */}
      <main className="w-full max-w-6xl mx-auto my-4 sm:my-6">
        <div className="text-center sm:text-left mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-2">
            <Zap className="w-3.5 h-3.5" /> Select Game Mode To Begin
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 drop-shadow-xl font-heading">
            TYPING RUNNER
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mt-1 font-medium drop-shadow-md">
            Choose your game mode below. After selection, the game starts immediately according to that mode!
          </p>
        </div>

        {/* MODE SELECTION GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {modes.map(m => {
            const isSelected = selectedMode === m.id;
            return (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedMode(m.id);
                  if (m.id === 'endless') {
                    onStartGame('endless');
                  } else if (m.id === 'time_attack') {
                    onStartGame('time_attack');
                  } else if (m.id === 'practice') {
                    onStartGame('practice');
                  } else if (m.id === 'creature_hunt') {
                    if (CHASERS[selectedChaserId as keyof typeof CHASERS]?.category !== 'creature') {
                      setSelectedChaserId('dragon');
                    }
                    setShowBeastPicker(true);
                  } else if (m.id === 'disaster_run') {
                    if (CHASERS[selectedChaserId as keyof typeof CHASERS]?.category !== 'disaster') {
                      setSelectedChaserId('tornado');
                    }
                    setShowDisasterPicker(true);
                  }
                }}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden backdrop-blur-md flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-slate-800/70">{m.icon}</div>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {m.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-0.5">{m.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.subtitle}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMode(m.id);
                      if (m.id === 'endless') onStartGame('endless');
                      else if (m.id === 'time_attack') onStartGame('time_attack');
                      else if (m.id === 'practice') onStartGame('practice');
                      else if (m.id === 'creature_hunt') setShowBeastPicker(true);
                      else if (m.id === 'disaster_run') setShowDisasterPicker(true);
                    }}
                    className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 transition"
                  >
                    {m.id === 'endless' && 'Play Now'}
                    {m.id === 'time_attack' && 'Start 90s Sprint'}
                    {m.id === 'practice' && 'Start Practice'}
                    {m.id === 'creature_hunt' && 'Select Beast & Hunt'}
                    {m.id === 'disaster_run' && 'Select Hazard & Run'}
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                  <span className="text-[10px] uppercase font-mono text-slate-500">Instant Start</span>
                </div>
              </div>
            );
          })}

          {/* CHALLENGES SPECIAL CARD */}
          <div
            onClick={onOpenChallenges}
            className="cursor-pointer p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-slate-950/80 hover:border-amber-400 transition-all duration-200 relative overflow-hidden backdrop-blur-md flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Trials
                </span>
              </div>
              <h3 className="text-base font-bold text-amber-200 mb-0.5">Challenge Gauntlets</h3>
              <p className="text-xs text-amber-300/70 leading-relaxed">
                Curated objective trials with coin & XP bounties.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-amber-500/30 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1 transition">
                Launch Missions <Play className="w-3 h-3 fill-current ml-0.5" />
              </span>
              <span className="text-[10px] uppercase font-mono text-amber-500/70">Trials</span>
            </div>
          </div>
        </div>

        {/* CHASER SELECTOR (When in Creature Hunt or Disaster Run) */}
        {(selectedMode === 'creature_hunt' || selectedMode === 'disaster_run') && (
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Choose Specific Pursuer:
              </h4>
              <span className="text-xs text-cyan-400 font-mono">
                {currentChaser.category.toUpperCase()} • BASE SPEED {currentChaser.baseSpeed} m/s
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {chaserList
                .filter(c =>
                  selectedMode === 'creature_hunt'
                    ? c.category === 'creature'
                    : c.category === 'disaster'
                )
                .map(c => {
                  const isCur = c.id === selectedChaserId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedChaserId(c.id);
                        onStartGame(selectedMode, c.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition group ${
                        isCur
                          ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                      title={`Start run against ${c.name}`}
                    >
                      <div className="font-bold text-xs truncate flex items-center justify-between">
                        <span>{c.name}</span>
                        <Play className="w-2.5 h-2.5 text-cyan-400 fill-current opacity-70 group-hover:opacity-100 transition" />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{c.title}</div>
                    </button>
                  );
                })}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400">
              <div>
                <strong className="text-slate-200">{currentChaser.name}:</strong>{' '}
                {currentChaser.threatDescription}
              </div>
              <div className="italic text-slate-400 text-[11px]">"{currentChaser.roarText}"</div>
            </div>
          </div>
        )}

        {/* FRONTPAGE SENTENCE DISPLAY (SEE-THROUGH GLASS BOX) */}
        <div className="mb-5 bg-black/25 backdrop-blur-[1px] border border-cyan-400/40 rounded-3xl p-4 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2 pb-1.5 border-b border-cyan-500/20">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              <Compass className="w-4 h-4 animate-spin" />
              OPENING SENTENCE • SELECTED MODE: <strong className="text-white uppercase">{selectedMode.replace('_', ' ')}</strong>
            </span>
            <span className="text-[11px] text-slate-400">Watch runner in background</span>
          </div>

          <div className="font-mono text-xl sm:text-2xl tracking-wide leading-relaxed text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            <span className="border-b-4 border-cyan-400 bg-cyan-950/60 px-1 rounded animate-pulse shadow-[0_0_12px_rgba(56,189,248,0.9)]">
              {previewSentence.slice(0, 1)}
            </span>
            <span className="text-slate-200">{previewSentence.slice(1)}</span>
          </div>
        </div>

        {/* START BUTTON TRIGGER */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => onStartGame(selectedMode, selectedChaserId)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-lg tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Play className="w-5 h-5 fill-current" /> {getStartButtonLabel()}
          </button>

          <div className="text-xs text-slate-300 font-mono text-center sm:text-left drop-shadow-md">
            Click to start in <strong className="text-cyan-400">{selectedMode.replace('_', ' ').toUpperCase()}</strong> • Typing controls your runner's speed
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono border-t border-slate-900 pt-3">
        <span>TYPING RUNNER v1.0 • Adaptive Survival</span>
        <span>
          Best WPM: <strong className="text-amber-400">{profile.bestWpm}</strong> • High Score:{' '}
          <strong className="text-purple-400">{profile.bestScore.toLocaleString()}</strong>
        </span>
      </footer>

      {/* STICKY QUICK-START ACTION BAR: lets players start run from anywhere without scrolling back up */}
      <aside
        aria-label="Quick launch bar"
        className="sticky bottom-0 z-40 w-full max-w-6xl mx-auto pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] mt-4 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-auto"
      >
        <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900/95 border border-cyan-500/40 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs uppercase font-bold text-slate-300 truncate">
                Selected Mode: <strong className="text-cyan-300 font-mono">{selectedMode.replace('_', ' ').toUpperCase()}</strong>
                {(selectedMode === 'creature_hunt' || selectedMode === 'disaster_run') && (
                  <span className="text-slate-400"> • {currentChaser.name}</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate hidden xs:block">
                Ready to sprint • Press Enter or click to run
              </div>
            </div>
          </div>

          <button
            onClick={() => onStartGame(selectedMode, selectedChaserId)}
            className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
            aria-label={`Start run in ${selectedMode.replace('_', ' ')} mode`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY NOW</span>
          </button>
        </div>
      </aside>

      {/* MYTHICAL BEAST SELECTION MODAL */}
      {showBeastPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
          <div className="w-full max-w-4xl bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-950/80 border border-purple-700/60 rounded-2xl text-purple-400">
                  <Crosshair className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white font-heading">
                    CHOOSE YOUR ALPHA PREDATOR
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Select a mythical beast to begin your hunt. Selecting any beast starts the hunt immediately!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBeastPicker(false)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {chaserList.filter(c => c.category === 'creature').map(beast => (
                <div
                  key={beast.id}
                  onClick={() => {
                    setSelectedChaserId(beast.id);
                    setSelectedMode('creature_hunt');
                    setShowBeastPicker(false);
                    onStartGame('creature_hunt', beast.id);
                  }}
                  className="cursor-pointer p-4 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-purple-400 hover:bg-slate-900 transition flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-purple-400 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/60">
                        {beast.baseSpeed} m/s
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                        {beast.environment.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition mb-0.5">
                      {beast.name}
                    </h3>
                    <div className="text-xs text-purple-400 font-medium mb-1.5">{beast.title}</div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-2">{beast.threatDescription}</p>
                    <div className="text-[11px] italic text-slate-500">"{beast.roarText}"</div>
                  </div>
                  <button
                    className="mt-3 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-purple-600/30"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> HUNT THIS BEAST
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DISASTER CATACLYSM SELECTION MODAL */}
      {showDisasterPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
          <div className="w-full max-w-4xl bg-slate-900 border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-950/80 border border-blue-700/60 rounded-2xl text-blue-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white font-heading">
                    CHOOSE YOUR CATACLYSM HAZARD
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Select a natural cataclysm to outrun. Selecting any disaster starts the run immediately!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDisasterPicker(false)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {chaserList.filter(c => c.category === 'disaster').map(hazard => (
                <div
                  key={hazard.id}
                  onClick={() => {
                    setSelectedChaserId(hazard.id);
                    setSelectedMode('disaster_run');
                    setShowDisasterPicker(false);
                    onStartGame('disaster_run', hazard.id);
                  }}
                  className="cursor-pointer p-4 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-blue-400 hover:bg-slate-900 transition flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-blue-400 px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/60">
                        {hazard.baseSpeed} m/s
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                        {hazard.environment.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition mb-0.5">
                      {hazard.name}
                    </h3>
                    <div className="text-xs text-blue-400 font-medium mb-1.5">{hazard.title}</div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-2">{hazard.threatDescription}</p>
                    <div className="text-[11px] italic text-slate-500">"{hazard.roarText}"</div>
                  </div>
                  <button
                    className="mt-3 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-blue-600/30"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> EVACUATE HAZARD
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
